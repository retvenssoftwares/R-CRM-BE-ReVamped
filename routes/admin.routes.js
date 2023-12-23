import express from 'express'
import AdminModel from '../controller/Admin.js';
import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();


router.post('/signup', AdminModel.AdminSignUp);

router.post('/validate-email',verifyJwt, AdminModel.VarifiedEmail);
router.post('/resend-otp',verifyJwt, AdminModel.resendOTP);
router.post("/resend_login_otp",AdminModel.resendOTPForLogin)

router.post('/login', AdminModel.loginAdmin);
router.post('/forgot-password', AdminModel.ForgotPassword);
router.post('/verify-otp', AdminModel.VerifyOtpBeforeResetPassword);
router.post('/update-password',verifyJwt, AdminModel.UpdatePassword);
router.post('/create_user',verifyJwt, AdminModel.AddUser);
router.get('/get_disposition',verifyJwt,AdminModel.getDisposition)
router.get('/call_details',verifyJwt,AdminModel.CallDetailAll)



// DashBoard
router.get('/stats-card',verifyJwt, AdminModel.getAgentStats);
router.get('/calls-bar-graph',verifyJwt, AdminModel.CallsMonthBarGraph);
router.get('/calls-today',verifyJwt, AdminModel.CallsCurrentDate);
router.get('/all-time-performer',verifyJwt, AdminModel.AllTimePerFormer);
router.get('/today-performer',verifyJwt, AdminModel.TodayPerFormer);

router.get('/agent-list',verifyJwt, AdminModel.AgentList);
router.get('/get-all-calls',verifyJwt, AdminModel.getAllCallList);

router.get('/get-all-guest',verifyJwt, AdminModel.getAllGuestListAdmin);
router.get("/getLeads",verifyJwt,AdminModel.Leads)
router.post("/disposition",verifyJwt,AdminModel.addDisposition)
router.post("/department",verifyJwt,AdminModel.addDepartment)
router.post("/designation",verifyJwt,AdminModel.addDesignation)
router.post("/addhotel",verifyJwt,AdminModel.addHotel)
router.get("/department",verifyJwt,AdminModel.getDepartMent)
router.get("/designation",verifyJwt,AdminModel.getDesignation)
router.get("/disposition",verifyJwt,AdminModel.getDisposition)
router.get("/hotel",verifyJwt,AdminModel.getHotel)
export default router