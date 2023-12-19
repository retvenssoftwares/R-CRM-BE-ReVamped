import express  from "express";
import {verifyJwt} from '../middleware/auth.js'
import report from "../controller/Reports.js"
const router = express.Router();

router.get('/getCallVolume',verifyJwt,report.getCallVolumeReport)
router.get('/getAvgCallDuration',verifyJwt,report.getCallDurationReport)
router.get('/getCallOutCome',verifyJwt,report.getCallOutComeReport)
router.get('/getCallResolution',verifyJwt,report.getFirstCallResolutionReport)
router.get('/getAgentPerformance',verifyJwt,report.getAgentPerformance)

export default router