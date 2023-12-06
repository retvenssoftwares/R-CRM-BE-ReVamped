import express from 'express'
import AdminModel from '../controller/Admin.js';
import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();


router.post('/signup', AdminModel.AdminSignUp);

router.post('/validate-email',verifyJwt, AdminModel.VarifiedEmail);
router.post('/resend-otp',verifyJwt, AdminModel.resendOTP);

router.post('/login', AdminModel.loginAdmin);
router.post('/forgot-password', AdminModel.ForgotPassword);
router.post('/verify-otp', AdminModel.VerifyOtpBeforeResetPassword);
router.post('/update-password',verifyJwt, AdminModel.UpdatePassword);
router.post('/create_user',verifyJwt, AdminModel.AddUser);

export default router