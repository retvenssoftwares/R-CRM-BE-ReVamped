import express from 'express'
import Agent from '../controller/Agent.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();

router.post('/login_agent', Agent.AgentLogin);
export default router