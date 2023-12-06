import express from 'express'
import Agent from '../controller/Agent.js';
import { verifyJwt } from '../middleware/auth.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();

router.post('/add_call',verifyJwt,Agent.AddCall)
router.get('/dashboard_card',verifyJwt,Agent.AgentDashboardCard)
router.get('/today_conversation',verifyJwt,Agent.TodayConversation)


export default router