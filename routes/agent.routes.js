import express from 'express'
import Agent from '../controller/Agent.js';
import { verifyJwt } from '../middleware/auth.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();

router.post('/login_agent', Agent.AgentLogin);
router.post('/add_call',verifyJwt,Agent.AddCall)
export default router