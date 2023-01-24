import express from "express";
import chatService from "./chatService.js";

const router = express.Router();

router.get("/:senderId/:receiverId", async (req, res) => {
	res.json(await chatService.getMessages(req.params.senderId, req.params.receiverId));
});

router.post("/:senderId/:receiverId", express.json(), async (req, res) => {
	res.json(await chatService.sendMessage(req.body));
});

export default router;