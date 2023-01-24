import express from "express";
import authService from "./authService.js";


const router = express.Router();

router.post("/register", express.json(), async (req, res) => {
	try {
		const create = await authService.register(req.body)
		res.json({data: req.body, message: "Registered successfully", code: "RegisteredSuccessfully"});
	} catch (e) {
		console.log(e)
		if (e.message === "UsernameIsAlreadyTaken") {
			return res.status(409).json({message: "Username is already taken!", code: "UsernameIsAlreadyTaken"});
		}
		if (e.message === "AccountWithEmailExists") {
			return res.status(409).json({message: "Account using this e-mail already exists!", code: "AccountWithEmailExists"});
		}
		return res.status(400).json({message: "Registering failed...", code: "RegisteringFailed"});
	}
});

router.post("/login", express.json(), async (req, res) => {
	// Pamiętać o setCookie i generowaniu tokenu
	const { email, password } = req.body;

	try {
		const {session, user} = await authService.login({email, password})
		// console.log({token, user})
		res.cookie("session-token", session.token, {
			httpOnly: true,
		});
		res.cookie("session-id", session.id, {
			httpOnly: true,
		});

		res.json({message: "Logged in successfully", code: "LoggedInSuccessfully", userData: user});

	} catch (e) {
		if (e.message === "InvalidEmailOrPassword") {
			return res.status(401).json({message: "Invalid email or password", code: "InvalidEmailOrPassword"});
		}
		return res.status(500).json({message: "Internal server error", code: "InternalServerError"});
		// throw e;
	}
});

// me
router.get("/me", async (req, res) => {
	const sessionToken = req.cookies["session-token"];
	const sessionId = req.cookies["session-id"];
	if (!sessionToken || !sessionId) {
		return res.status(401).json({message: "Unauthorized", code: "Unauthorized"});
	}
	try {
		const user = await authService.me({sessionToken, sessionId});
		res.json({message: "User data", code: "UserData", userData: user});
	} catch (e) {
		if (e.message === "InvalidSession") {
			return res.status(401).json({message: "Invalid session", code: "InvalidSession"});
		}
		return res.status(500).json({message: "Internal server error", code: "InternalServerError"});
	}
});

router.post("/logout", async (req, res) => {
	const sessionToken = req.cookies["session-token"];
	const sessionId = req.cookies["session-id"];
	if (!sessionToken || !sessionId) {
		return res.status(401).json({message: "Unauthorized", code: "Unauthorized"});
	}
	try {
		await authService.logout({sessionToken, sessionId});
		res.cookie("session-token", "", {
			expires: new Date(0),
			httpOnly: true,
		});
		res.cookie("session-id", "", {
			expires: new Date(0),
			httpOnly: true,
		});
		res.status(200).json({message: "Logged out successfully", code: "LoggedOutSuccessfully"});
	} catch (e) {
		if (e.message === "InvalidSession") {
			// the user tries to logout from non-existing session
			// despite auth service throwing an error, we still want to clear the cookies
			res.cookie("session-token", "", {
				expires: new Date(0),
				httpOnly: true,
			});
			res.cookie("session-id", "", {
				expires: new Date(0),
				httpOnly: true,
			});
			return res.status(200).json({message: "Logged out successfully", code: "LoggedOutSuccessfully"});
		}
		return res.status(500).json({message: "Internal server error", code: "InternalServerError"});
	}
});

export default router;


// register
// login
// logout
// me
