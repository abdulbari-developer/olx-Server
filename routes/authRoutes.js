import express from 'express'
import client from '../config.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
dotenv.config()
const router = express.Router()
const database = client.db("Olx-clone")
const users = database.collection('Users')



function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/user/register', async (req, res, next) => {
    try {
        if (!req.body.firstName || !req.body.lastName || !req.body.age || !req.body.email || !req.body.password) {
            return res.send({
                status:0,
                message:"Fill out all the fields"
            })
        } else {
            const email = req.body.email.toLowerCase()
            const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            if (!email.match(emailFormat)) {
                 return res.send({
                status:0,
                message:"fill correct email pattern "
            })
            }
            if (!req.body.password.match(passwordValidation)) {
                 return res.send({
                status:0,
                message:"fill correct password pattern"
            })
            }
            const checkUser = await users.findOne({ email: email })
            if (checkUser) {
                return res.send({
                status:0,
                message:"email already exist "
            })
            }
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const otp = generateOTP()
            const newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                age: req.body.age,
                email: email,
                password: hashedPassword,
                otp: otp,
                isVerified: false
            }
            const insertUser = await users.insertOne(newUser)

            if (!insertUser) {
                 return res.send({
                status:0,
                message:"Something went wrong while inserting"
            })
            }
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.PASSWORD_APP
                }
            })
            let mailOption = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "OTP Verification",
                text: `your OTP is ${otp}`
            }

            transporter.sendMail(mailOption, (err, info) => {
                if (err) {
                    return res.send({
                        status: 0,
                        message: "error sending OTP"
                    })
                }
                return res.send({
                        status: 1,
                        message:"User registered successfully. Please verify OTP sent to email."
                    })
            })

        }
    } catch (error) {
        return res.send({
                        status: 0,
                        message:"something went wrong"
                    })
    }
})




router.post('/user/verifyOTP', async (req, res) => {
    try {
        let email = req.body.email.toLowerCase()
        let otp = req.body.otp
        const checkUser = await users.findOne({ email: email })
        if (!checkUser) {
            return res.send({
                status: 0,
                message: "User not found"
            })
        }
        if (checkUser.otp === otp) {
            const updateUser = await users.updateOne({ email: email }, { $set: { isVerified: true }, $unset: { otp: "" } })
            return res.send({
                status: 2,
                message: "OTP verified successfully! You can now login."
            })
        }
        else {
            return res.send({
                status: 0,
                message: "Invalid OTP"
            })
        }
    } catch (error) {
        res.send(error)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.send({
                status: 0,
                message: "Email and Password is required"
            })
        }
        let email = req.body.email.toLowerCase()
        const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!email.match(emailFormat)) {
            return res.send({
                status: 0,
                message: "email and password is incorrect"
            })
        }
        let user = await users.findOne({ email: email });
        if (!user) {
            return res.send({
                status: 0,
                message: "User is not registered"
            })
        }
        if (!user.isVerified) {
            return res.send({
                status: 0,
                message: "verify your email first"
            })
        }
        let checkPassword = await bcrypt.compare(req.body.password, user.password)
        if (!checkPassword) {
            return res.send({
                status: 0,
                message: "Email or Password is incorrect"
            })
        }

        let token = jwt.sign({
            _id:user._id,
            email,
            firstName: user.firstName,
        }, process.env.SECRET, { expiresIn: "24h" })

        // res.cookie("token", token, {
            // httpOnly: true,
            // secure: true,    
    //sameSite: 'lax',
    //maxAge: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    //path: '/'
        // })
        res.send({
            status: 3,
            message: "success",
            "token": token
        })


    } catch (error) {
        res.send(error)
    }
})
export default router