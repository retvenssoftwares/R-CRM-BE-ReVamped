import User from "../model/User.js";
import { generateRandomNumber } from "../utils/generatePassword.js";
import {randomString} from '../middleware/custom.js' 
import  bcrypt  from 'bcryptjs';
import dotenv from "dotenv";
import axios from 'axios'

dotenv.config({ path: "./.env" });

let BASE_URL = process.env.BASE_URL

class AdminModel {
    static async AddUser(req, res, next) {
      try {
        // if (req.authData.role === "ADMIN") {
          let email = req.body.email;
          let name = req.body.name;
          let gender = req.body.gender;
          let dob = req.body.dob
          let phone_number = req.body.phone_number
          let password = req.body.password
  
          let findOldUser = await User.findOne({ email }).lean();
          let findAgent = await User.find({role:"AGENT"}).lean()
  
          if (findOldUser) {
            return res.status(409).json({
              success: false,
              code: 409,
              message: "User already exists",
            });
          } else {
            const randomPassword = await randomString(
              8,
              "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            );
            const encryptedPassword = await bcrypt.hash(randomPassword, 10);
  
            // let __dirname = path.resolve();
  
            // await sendMail({
            //   email: email,
            //   subject: 'Login Credential of your account',
            //   template: 'crudential-mail.ejs',
            //   data: {
            //     name:req.body.name,
            //     password:randomPassword
            //   }
            // });
  
            let newUser = await User.create({
              email,
              name,
              gender,
              dob,
              phone_number,
              password: encryptedPassword,
              // created_by:req.authData._id,
              agent_id:(findAgent.length + 1) || 1,
              agent_text:req.query.ext_name,
              role:"AGENT"
            });
          
            
            const data = {
              agent_id:(findAgent.length + 1) || 1,
              agent_text:req.query.ext_name
            };
        
            const options = {
              method: 'POST',
              url: BASE_URL + '/createagent',
              headers: {
                accept: 'application/json',
                'x-api-version': '2022-09-01',
                'content-type': 'application/json',
                'Authorization': process.env.API_KEY,
              },
              data: data,
            };
            const apiResponse = await new Promise(async (resolve, reject) => {
              axios
                .request(options)
                .then(function (response1) {
                  resolve(response1.data);
        
                  return response;
                })
                .catch(function (error) {
                  reject(error);
                  return response;
                });
            });
            response = new Response(200, 'T', apiResponse);
  
            return res.status(200).json({
              success: true,
              code: 200,
              message: `User Created`,
            });
  
          }
        // } else {
        //   return res.status(401).json({
        //     status: false,
        //     code: 401,
        //     message: "Not Authorized",
        //   });
        // }
      } catch (error) {
        console.log(error)
        return res.status(500).json({
          status: false,
          code: 500,
          message: error.message,
        });
      }
    }

  }



  
  export default AdminModel;