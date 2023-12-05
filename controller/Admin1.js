import User from "../model/User.js";
import { generateRandomNumber } from "../utils/generatePassword.js";
import bcrypt from 'bcryptjs';
import { signJwt } from "../middleware/auth.js";
import { sendMail } from "../utils/sendMail.js";
import ErrorHandler from "../utils/errorHandler.js";

class AdminModel {
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

            let user = await User.findOne({ email }).lean();

            if (user) {
                return res.status(403).json({
                    status: false,
                    code: 403,
                    message: "Email already exist",
                });
            }
            const expires = new Date(new Date().getTime() + 5 * 60 * 1000).getTime();
            const encryptedPassword = await bcrypt.hash(password, 10);
            const otp = generateRandomNumber();
            user = await User.create({
                phone_number: phone_number,
                email: email,
                dob: dob,
                gender: gender,
                password: encryptedPassword,
                otp: otp,
                expires: expires
            });
            const { _id } = user;
            const jwtToken = await signJwt({ _id, email });

            await sendMail({
                email: email,
                subject: "OTP For Validating Email",
                template: "crudential-mail.ejs",
                data: {
                    name: user.name ? user.name : "USER",
                    password: otp,
                },
            });

            return res.status(200).json({
                status: true,
                code: 200,
                message: "OTP send to your mail...",
                token: jwtToken.token
            });

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    static async VarifiedEmail(req, res, next) {
        try {
            const userId = req.authData._id;
            const otp = req.body.otp;

            if (!userId || !otp) {
                return res.status(422).json({
                    status: false,
                    code: 422,
                    message: "Not getting details",
                });
            }

            let user = await User.findById(userId).lean();

            if (!user) {
                return res.status(403).json({
                    status: false,
                    code: 403,
                    message: "User does not exist",
                });
            }

            const details = await User.findOne({ _id: userId, otp: otp });

            if (details) {
                if (details.expires > new Date().getTime()) {

                    await User.findByIdAndUpdate(userId, { $set: { otp: 0, expires: 0, is_email_Verified: true } });

                    return res.status(200).json({
                        status: true,
                        code: 200,
                        message: "email verified successfully"
                    });
                } else {
                    return res.status(401).json({
                        status: false,
                        code: 401,
                        message: "otp is expired"
                    });
                }

            } else {

                return res.status(410).json({
                    status: false,
                    code: 410,
                    message: "OTP Does Not Match"
                });

            }




        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    static async ForgotPassword(req, res, next) {
        try {
            const email = req.body.email;
            if (!email) {
                return res.status(422).json({
                    status: false,
                    code: 422,
                    message: "Please fill all the required field",
                });
            }

            let user = await User.findOne(email).lean();

            if (!user) {
                return res.status(403).json({
                    status: false,
                    code: 403,
                    message: "Email does not exists",
                });
            }

            const otp = generateRandomNumber();
            const expires = new Date();
            user = await User.findOneAndUpdate({ email }, {
                $set: {
                    otp: otp,
                    expires: expires
                }
            }).lean();
            await sendMail({
                email: email,
                subject: "OTP for reset Password",
                template: "crudential-mail.ejs",
                data: {
                    name: user.name ? user.name : "USER",
                    password: otp,
                },
            });
            const { _id, role, name } = user;
            const jwtToken = await signJwt({ _id, role, name, email });
            return res.status(200).json({
                status: true,
                code: 200,
                message: "OTP send to your mail...",
                token: jwtToken
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    static async UpdatePassword(req, res, next) {
        try {
            const email = req.authData.email;
            const userId = req.authData._id;
            const role = req.authData.role;
            const name = req.authData.name;

            if (role === 'AGENT') {
                return res.status(401).json({
                    status: true,
                    code: 401,
                    message: "You are not authorized"
                });
            }

            return res.status(200).json({
                status: true,
                code: 200,
                message: "OTP send to your mail...",
                token: jwtToken
            });
        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }

    static async resendOTP(req, res, next) {
        try {
            const userId = req.authData._id;
            if (!userId) {
                return res.status(402).json({
                    status: false,
                    code: 402,
                    message: "Something went wrong!!",
                });
            }
            const expires = new Date(new Date().getTime() + 5 * 60 * 1000).getTime();
            const otp = generateRandomNumber();
            let user = await User.findByIdAndUpdate(userId, {
                $set: {
                    otp,
                    expires
                }
            }).lean();

            await sendMail({
                email: user.email,
                subject: "OTP For Validating Email",
                template: "crudential-mail.ejs",
                data: {
                  name: user.name ? user.name : "USER",
                  password: otp,
                },
              });

            if (!user) {
                return res.status(402).json({
                    status: false,
                    code: 402,
                    message: "Something went wrong!!",
                });
            }

            return res.status(200).json({
                status: true,
                code: 200,
                message: "otp is send to your email successfully",
            });

        } catch (error) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
}




export default AdminModel;