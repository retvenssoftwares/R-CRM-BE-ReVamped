import express from 'express'
import Agent from '../controller/Agent.js';
import { verifyJwt } from '../middleware/auth.js';
import AgentModel from '../controller/Agent.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();

router.post('/add_call',verifyJwt,Agent.AddCall)
router.get('/dashboard_card',verifyJwt,Agent.AgentDashboardCard)
router.get('/today_conversation',verifyJwt,Agent.TodayConversions)
router.get('/call_details',verifyJwt,Agent.agentCalls)
router.get('/hotel_destination',verifyJwt,Agent.hotelDestinationList)
router.get('/hotel_name',verifyJwt,Agent.hotelNameList)
router.get('/pending_follow_up',verifyJwt,Agent.PendingFollowUp)
router.get('/call_graph',verifyJwt,Agent.CallsBarGraph)
router.get('/disposition_graph',verifyJwt,Agent.dispositionGraph)
router.post("/pause_calls",verifyJwt,AgentModel.Pause)
router.get("/get_pause_call",verifyJwt,AgentModel.GetPauseCall)
router.post("/logOut",verifyJwt,AgentModel.logOut)
router.patch("/updateAgent",verifyJwt,AgentModel.updateAgent)
router.get("/getPauseReasons",Agent.GetPauseReason)
router.patch("/updateCalls",verifyJwt,Agent.updateGuestCalls)         
// router.get("/getLead",verifyJwt,Agent.Leads)
  




export default router