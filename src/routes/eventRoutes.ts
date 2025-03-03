import express from 'express';
import requireAuth from '../middleware/auth';
import { createEvent, getEvents } from '../controllers/eventController';

const eventRouter = express.Router();

eventRouter.route('/book').post(createEvent);
eventRouter.route('/getEvents').get(requireAuth, getEvents);

export default eventRouter