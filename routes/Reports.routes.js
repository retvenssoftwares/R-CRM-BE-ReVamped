import express  from "express";
import {verifyJwt} from '../middleware/auth.js'
import report from "../controller/Reports.js"
const router = express.Router();

router.get('/getCallVolume',verifyJwt,report.getCallVolumeReport)

export default router