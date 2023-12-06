import express from 'express'
import Agent from '../controller/Agent.js';
import { verifyJwt } from '../middleware/auth.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();

router.post('/add_call',verifyJwt,Agent.AddCall)
router.get('/dashboard_card',verifyJwt,Agent.AgentDashboardCard)
router.get('/today_conversation',verifyJwt,Agent.TodayConversions)
router.get('/call_details',verifyJwt,Agent.agentCalls)
router.get('/hotel_destination',verifyJwt,Agent.hotelDestinationList)
router.get('/hotel_name',verifyJwt,Agent.hotelNameList)

router.get('/pending_follow_up',verifyJwt,Agent.PendingFollowUp)





export default router