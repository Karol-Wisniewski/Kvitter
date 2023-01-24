import express from "express";
import tweetsService from "./tweetsService.js";
import authService from "../auth/authService.js";

const router = express.Router();

router.get("/", async (req, res) => {
	res.json(await tweetsService.getAll());
});

router.get("/:userId", async (req, res) => {
	res.json(await tweetsService.getTweetsByUserId(req.params.userId));
});

router.get("/:userId/liked", async (req, res) => {
	res.json(await tweetsService.getLikedTweets(req.params.userId));
});

router.get("/:userId/count", async (req, res) => {
	res.json(await tweetsService.countTweetsByUserId(req.params.userId));
});

router.post("/:userId/like/:tweetId", express.json(), async (req, res) => {
	res.json(await tweetsService.likeTweet(req.body));
});

router.post("/:userId/dislike/:tweetId", express.json(), async (req, res) => {
	res.json(await tweetsService.dislikeTweet(req.body));
});

router.get("/comments/all", async (req, res) => {
	res.json(await tweetsService.getAllComments());
});

router.get("/:userId/comments", express.json(), async (req, res) => {
	res.json(await tweetsService.getCommentsForUser(req.params.userId));
});

router.post("/:userId/comment/:tweetId", express.json(), async (req, res) => {
	res.json(await tweetsService.commentTweet(req.body));
});

router.post("/add", express.json(), async (req, res) => {

	const sessionToken = req.cookies["session-token"];
	const sessionId = req.cookies["session-id"];
	console.log(sessionToken, sessionId)
	if (!sessionToken || !sessionId) {
		return res.status(401).json({message: "Unauthorized (no cookies)", code: "Unauthorized"});
	}
	try {
		const user = await authService.me({sessionToken, sessionId});
		if (req.body.userId !== user.id) {
			/*
				The HTTP 403 Forbidden response status code indicates that the server understands the request but refuses to authorize it.
			*/
			return res.status(403).json({message: "Forbidden", code: "Forbidden"});
		}

		try {
			const create = await tweetsService.addTweet(req.body)
			res.json({message: "Tweet added successfully", code: "TweetAddedSuccessfully"});
		} catch (e) {
			// console.log(e)
			return res.status(400).json({message: "Adding a tweet failed...", code: "AddingTweetFailed"});
		}
	} catch (e) {
		if (e.message === "InvalidSession") {
			return res.status(401).json({message: "Unauthorized (invalid session)", code: "Unauthorized"});
		}
	}
});

router.delete("/:tweetId", async (req, res) => {
	res.json(await tweetsService.deleteTweetById(req.params.tweetId));
});

export default router;