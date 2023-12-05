import User from "../model/User";
import { generateRandomNumber } from "../utils/generatePassword";
import { bcrypt } from 'bcryptjs';

class UserModel {
    static async AdminSignUp(req, res, next) {
      try {
        const email = req.body.email;
        const password = req.body.password;
        const phone_number = req.body.phone_number;
        const dob = req.body.dob;
        const gender = req.body.gender;
        if(!email || !password || !phone_number || !dob){
            return res.status(422).json({
                status: false,
                code: 422,
                message: "Please fill all the required field",
            });
        }

        let user = await User.findOne(email).lean();

        if(user){
            return res.status(403).json({
                status: false,
                code: 403,
                message: "Email already exist",
            });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            phone_number : phone_number,
            email : email,
            dob : dob,
            gender : gender,
            password: encryptedPassword,
            otp : generateRandomNumber(),
            expire : "TODO"
        });

      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  }



  
  export default UserModel;