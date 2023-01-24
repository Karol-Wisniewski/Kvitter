import express from "express";
import usersService from "./usersService.js";

const router = express.Router();

router.get("/", async (req, res) => {
	res.json(await usersService.getAll());
});

router.get("/:id", async (req, res) => {
	res.json(await usersService.getById(req.params.id));
});

router.post("/search/nameOrUsernameOrSurname", express.json(), async (req, res) => {
	res.json(await usersService.searchForUserByNameOrUsernameOrSurname(req.body));
});

router.post("/search/nameAndSurname", express.json(), async (req, res) => {
	res.json(await usersService.searchForUserByNameAndSurname(req.body));
});

router.get("/:id/following", async (req, res) => {
	res.json(await usersService.getFollowedUsers(req.params.id));
});

router.get("/:id/followers", async (req, res) => {
	res.json(await usersService.getFollowingUsers(req.params.id));
});

router.put("/:id", express.json(), async (req, res) => {
	try {
		const result = await usersService.updateById(req.body)
		res.json({message: "Your changes have been saved.", code: "ChangesSaved"});
	} catch (e) {
		if (e.message === "AccountWithEmailExists") {
			return res.status(409).json({message: "Account using this e-mail already exists!", code: "AccountWithEmailExists"});
		}
		if (e.message === "AccountWithUsernameExists") {
			return res.status(409).json({message: "Provided username is already taken!", code: "AccountWithUsernameExists"});
		}
		return res.status(400).json({message: "Something went wrong, try again later.", code: "UpdatingFailed"});
	}
});

router.put("/:id/picture/delete", express.json(), async (req, res) => {
	try {
		const result = await usersService.deleteProfilePicture(req.body)
		res.json({message: "Your changes have been saved.", code: "ChangesSaved"});
	} catch (e) {
		return res.status(400).json({message: "Something went wrong, try again later.", code: "UpdatingFailed"});
	}
});

router.delete("/:id", async (req, res) => {
	res.json(await usersService.deleteById(req.params.id));
});

router.post("/:followerId/follow/:followingId", express.json(), async (req, res) => {
	res.json(await usersService.followByIds(req.body));
});

router.post("/:followerId/unfollow/:followingId", express.json(), async (req, res) => {
	res.json(await usersService.unfollowByIds(req.body));
});


export default router;
