import express from 'express'
import AdminModel from '../controller/Admin.js';
const router = express.Router();


router.post('/create_user', AdminModel.AddUser);

export default router