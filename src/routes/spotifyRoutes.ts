import express from "express";
import requireAuth from "../middleware/auth";
import { getScore } from "../controllers/spotifyController";

const router = express.Router();

router.route("/score").post(requireAuth, getScore);

export default router;
