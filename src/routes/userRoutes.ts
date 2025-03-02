import express from "express";
import requireAuth from "../middleware/auth";
import { loginUser, registerUser, signout } from "../controllers/userController";
const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/signout').get(signout);

export default router;