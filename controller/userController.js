const {userCollection} = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const {registerSchema} = require('../middleware/validationSchema')
const { createRefreshToken, generateFreshToken, sendRefreshToken } = require('../utils/generateToken')
const Jwt = require('jsonwebtoken');
const { v4 } = require("uuid");
const bcrypt = require('bcryptjs')
const {forgetPasswordCollection} = require('../models/forgetPasswords');
const { send } = require("../utilities/sendEmail");

const registerUser = asyncHandler(async (req,res) => {
    const {firstName, surname, email, phone, password, referral} = req.body;
  try {
    const doesUserExist = await userCollection.findOne({email});
        if(doesUserExist) return res.send("User exists");
    registerSchema(req, res);
    const user = await userCollection.create({
        firstName,
        surname,
        email,
        phone,
        password,
        referral
    });
   return res.status(201).send("User created successfully");
  } catch (error) {
       return res.send(`could not create account because: ${error.message}`);
  }

});

const loginUser = asyncHandler(async (req,res) => {
    try {
        const { email, password } = req.body;
        const doesUserExist = await userCollection.findOne({ email });
        if (doesUserExist && await doesUserExist.matchPassword(password)) {
            const { email: userEmail, _id} = doesUserExist;
            const refreshToken = createRefreshToken(userEmail, _id);
            //   doesUserExist.refreshToken = refreshToken;
            sendRefreshToken(res, refreshToken);
            req.refreshToken = refreshToken;
            
            const token = Jwt.sign({
                email: userEmail,
                userId: _id,
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

            return res.send({
                message: "Sign in Successful",
                token
            });
           
        } else {
           
            res.status(401).send("Invalid email or password");
        }
    } catch (error) {
        console.log(error);
    }

});

const logout = asyncHandler(async (req, res) => {
    const clear = res.clearCookie('refreshToken', {httpOnly: true});
    // Logic here for also remove refreshtoken from db
   res.send({
        message: 'Logged out',
    });
});

const getUser = asyncHandler(async(req, res) => {
       const findUser =  await userCollection.findOne({_id: req.params.id});
            if(findUser) return res.json({userDetails: findUser})

});


const getNewToken = asyncHandler(async (req, res) => {
  generateFreshToken(req, res);
});

const passwordReset = asyncHandler(async(req, res) => {
        try {
            const { newPassword, token } = req.body;
    
            const user = await forgetPasswordCollection.findOne({token});
    
            if(!user) return res.status(400).send("invalid-token");
            
            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
    
            await userCollection.findByIdAndUpdate(user.userId, {
                password: newHashedPassword
            }, {
                new: true
            });
    
            await forgetPasswordCollection.findOneAndDelete({token});
    
            res.send({
                message: "Password changed successfully!"
            });
    
        } catch (error) {
            console.log(error);
            res.status(error.status || "500").send(error.message || "Internal server error");
        }
});

const forgetPassword = asyncHandler(async(req, res) => {
        try {
           const {email} = req.body;
           const user = await userCollection.findOne({email});
           if(!user) return res.status(404).send("no-user-found");
    
           const uid = v4();
            await forgetPasswordCollection.create({
                userId: user._id,
                token: uid
            });
    
            await send.sendMail({
                to: email,
                subject: "Password Reset",
                html: `
                    <div>
                        <h1>Password Reset</h1>
                        <div>Click <a href="">here</a> to reset your password</div>
                        <div>or use this UID = ${uid}</div>
                    </div>
                `
            });
    
            res.send({
                message: "Email sent Successfully!"
            });
    
        } catch (error) {
            console.log(error);
            res.status(error.status || 500).send(error.message || "Internal server error");
        }
})
module.exports = {
    registerUser,
    logout,
    getNewToken,
    loginUser,
    getUser,
    passwordReset,
    forgetPassword
}
