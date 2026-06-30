import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const user = await User.findById(loggedInUserId).populate("contacts", "-password");

    res.status(200).json(user.contacts || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addContact = async (req, res) => {
  try {
    const { email } = req.body;
    const loggedInUserId = req.user._id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const contactUser = await User.findOne({ email }).select("-password");
    if (!contactUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (contactUser._id.toString() === loggedInUserId.toString()) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    const currentUser = await User.findById(loggedInUserId);
    if (currentUser.contacts.includes(contactUser._id)) {
      return res.status(400).json({ message: "Contact already added" });
    }

    currentUser.contacts.push(contactUser._id);
    await currentUser.save();

    res.status(200).json(contactUser);
  } catch (error) {
    console.error("Error in addContact: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Auto-add contacts for both users so they can see/reply to each other
    await User.findByIdAndUpdate(senderId, { $addToSet: { contacts: receiverId } });
    await User.findByIdAndUpdate(receiverId, { $addToSet: { contacts: senderId } });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeContact = async (req, res) => {
  try {
    const { id: contactId } = req.params;
    const loggedInUserId = req.user._id;

    const currentUser = await User.findById(loggedInUserId);
    currentUser.contacts = currentUser.contacts.filter(
      (id) => id.toString() !== contactId.toString()
    );
    await currentUser.save();

    res.status(200).json({ message: "Contact removed successfully" });
  } catch (error) {
    console.error("Error in removeContact: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (error) {
    console.error("Error in clearChat: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
