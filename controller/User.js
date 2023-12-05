import User from "../model/User";
import { generateRandomNumber } from "../utils/generatePassword";
import { bcrypt } from 'bcryptjs';

class UserModel {
    // static async UserLogin(req, res, next) {
    //   try {
    //     let email = req.body.email;
    //     let password = req.body.password;

    //     if (!email && !password) {
    //       return res.status(422).json({
    //         status: false,
    //         code: 422,
    //         message: "Please fill all the required field",
    //       });
    //     } else {
    //       let findUser = await User.findOne({ email }).lean();

    //       if (!findUser) {
    //         return res.status(404).json({
    //           status: false,
    //           code: 404,
    //           message: "Email Not Found",
    //         });
    //       } else {
    //         if (password === findUser.password) {
    //           const _id = findUser._id;
    //           const role = findUser.role;
    //           const name = findUser.name;
    //           const email = findUser.email;

    //           const jwtToken = await signJwt({ _id, role, name, email });
    //           let updateUser = await User.findByIdAndUpdate(
    //             findUser._id,
    //             { is_logged_in: true, logged_in_date: new Date() },
    //             { new: true }
    //           );
    //           let expiryDate = new Date();
    //           expiryDate.setMinutes(expiryDate.getMinutes() + 120);

    //           schedule.scheduleJob(new Date(), async function () {
    //             let updateUser = await User.findByIdAndUpdate(
    //               findUser._id,
    //               { is_logged_in: false },
    //               { new: true }
    //             );
    //           });

    //           return res.status(200).json({
    //             status: true,
    //             code: 200,
    //             message: "Logged in successfully!!",
    //             data: jwtToken,
    //           });
    //         } else {
    //           return res.status(401).json({
    //             code: 401,
    //             success: false,
    //             message: "Password didn't match",
    //           });
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     return next(new ErrorHandler(error.message, 500));
    //   }
    // }



    static async AdminSignUp(req, res, next) {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const phone_number = req.body.phone_number;
            const dob = req.body.dob;
            const gender = req.body.gender;
            if (!email || !password || !phone_number || !dob) {
                return res.status(422).json({
                    status: false,
                    code: 422,
                    message: "Please fill all the required field",
                });
            }

            let user = await User.findOne(email).lean();

            if (user) {
                return res.status(403).json({
                    status: false,
                    code: 403,
                    message: "Email already exist",
                });
            }

            const encryptedPassword = await bcrypt.hash(password, 10);

            user = await User.create({
                phone_number: phone_number,
                email: email,
                dob: dob,
                gender: gender,
                password: encryptedPassword,
                otp: generateRandomNumber(),
                expire: "TODO"
            });

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
}




export default UserModel;