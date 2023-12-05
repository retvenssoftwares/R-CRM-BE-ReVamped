import express from 'express'
import AdminModel from '../controller/Admin.js';
import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();


router.post('/signup', AdminModel.AdminSignUp);

router.post('/validate-email',verifyJwt, AdminModel.VarifiedEmail);
router.post('/resend-otp',verifyJwt, AdminModel.resendOTP);



router.post('/create_user', AdminModel.AddUser);

export default router