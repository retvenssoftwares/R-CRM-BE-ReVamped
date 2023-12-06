import express from 'express'
import Agent from '../controller/Agent.js';
import { verifyJwt } from '../middleware/auth.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();

router.post('/add_call',verifyJwt,Agent.AddCall)
router.get('/dashboard',verifyJwt,Agent.AgentDashboard)

export default router