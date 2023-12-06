import express from 'express'
import {verifyJwt} from '../middleware/auth.js'
import guest from "../controller/Guest.js"
const router = express.Router();


router.get("/get_guest_callDetails",verifyJwt,guest.getCallAndGuestDetails)     
router.get("/getAllGuest",verifyJwt,guest.getAllGuestDetails)                                         

export default router