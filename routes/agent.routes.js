import express from 'express'
import Agent from '../controller/Agent.js';
// import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();


router.post('/login_agent', Agent.AgentLogin);
// router.get('/profile',AdminModel.ProfileView);

// router.post('/login', AdminModel.AdminLogin);
// router.get('/user_list', AdminModel.UserList);
// router.get('/properties/:property_id?',AdminModel.getAllPropertiesforAdmin);
// router.patch('/assign_property',AdminModel.addUserIdByAdmin);

// router.get('/city', AdminModel.cityList);
// router.get('/ota',AdminModel.otaList);
// router.patch('/status',AdminModel.statusUpdate);


export default router