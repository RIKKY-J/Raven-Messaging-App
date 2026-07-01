import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Verification from "../models/verification.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";

const transporter = process.env.GMAIL_USER && process.env.GMAIL_PASS
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    })
  : null;

const sendVerificationEmail = async (email, code) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Raven Chat" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Verify your email - Raven",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px">
            <h2 style="color: #4f46e5; text-align: center;">Welcome to Raven!</h2>
            <p>Thank you for signing up. Please verify your email address by using the 6-digit verification code below:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1f2937; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 15 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send verification email to ${email}:`, error);
      throw new Error("Failed to send verification email");
    }
  } else {
    console.log(`\n==========================================\n[Mock Mail] Verification code for ${email} is: ${code}\n==========================================\n`);
  }
};

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the password now
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save or update verification record
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await Verification.findOneAndUpdate(
      { email },
      {
        fullName,
        password: hashedPassword,
        code: verificationCode,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Send email
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: "Verification code sent successfully",
      email,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifySignup = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const record = await Verification.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "Verification code expired or not found. Please sign up again." });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Code is valid! Create the user.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await Verification.deleteOne({ email });
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({
      fullName: record.fullName,
      email: record.email,
      password: record.password, // Password was already hashed!
    });

    await newUser.save();

    // Generate JWT token
    generateToken(newUser._id, res);

    // Delete verification record
    await Verification.deleteOne({ email });

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.log("Error in verifySignup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resendCode = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const record = await Verification.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: "No pending signup found for this email. Please sign up again." });
    }

    // Generate new code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    record.code = newCode;
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Reset expiry to 15 mins
    await record.save();

    // Send email
    await sendVerificationEmail(email, newCode);

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.log("Error in resendCode controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
