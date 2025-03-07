import express from "express";
import requireAuth from "../middleware/auth";

import { getTickets } from "../controllers/ticketController";

const router = express.Router();

router.route("/gettickets").get(requireAuth, getTickets);

export default router;
