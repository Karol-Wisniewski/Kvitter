import config from "./config/config.js";
import express from "express";
import usersRouter from "./features/users/usersRouter.js";
import authRouter from "./features/auth/authRouter.js";
import tweetsRouter from "./features/tweets/tweetsRouter.js"
import chatRouter from "./features/chat/chatRouter.js"
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();

app.use(cors({
	origin: "http://localhost:3001",
	credentials: true
}));

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.use(cookieParser());

app.use("/users", usersRouter);

app.use("/auth", authRouter);

app.use("/chat", chatRouter);

app.use("/tweets", tweetsRouter);

app.listen(config.apiServer.port, () => {
	console.log(`Kvitter API Server is running on http://localhost:${config.apiServer.port}!`)
})
