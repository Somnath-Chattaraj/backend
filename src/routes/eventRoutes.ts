import express from "express";
import requireAuth from "../middleware/auth";
import {
  createEvent,
  getEvents,
  getEvent,
} from "../controllers/eventController";

const eventRouter = express.Router();

eventRouter.route("/createEvent").post(createEvent);
eventRouter.route("/getEvents").get(getEvents);
eventRouter.route("/getEvent/:id").get(requireAuth, getEvent);

export default eventRouter;
