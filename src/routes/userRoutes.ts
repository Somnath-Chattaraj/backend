import express from "express";
import requireAuth from "../middleware/auth";
import {
  loginUser,
  registerUser,
  signout,
  getUser,
  logOut,
} from "../controllers/userController";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/signout").get(signout);
router.route("/me").get(requireAuth, getUser);
router.route("/logout").get(logOut);

export default router;
