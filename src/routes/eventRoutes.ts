import express from 'express';
import requireAuth from '../middleware/auth';
import { createEvent } from '../controllers/eventController';

const eventRouter = express.Router();

eventRouter.route('/book').post(createEvent);

export default eventRouter