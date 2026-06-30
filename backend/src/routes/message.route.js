import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, addContact, removeContact, clearChat } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.post("/contacts/add", protectRoute, addContact);
router.delete("/contacts/:id", protectRoute, removeContact);
router.delete("/chat/:id", protectRoute, clearChat);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;
