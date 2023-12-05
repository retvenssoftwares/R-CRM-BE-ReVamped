import express from 'express'
import AdminModel from '../controller/Admin1.js';
import {verifyJwt} from '../middleware/auth.js'
const router = express.Router();


router.post('/signup', AdminModel.AdminSignUp);

router.post('/validate-email',verifyJwt, AdminModel.VarifiedEmail);


export default router