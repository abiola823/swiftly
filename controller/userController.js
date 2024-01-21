const {userCollection} = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const {registerSchema} = require('../middleware/validationSchema')
const { createRefreshToken, generateFreshToken, sendRefreshToken } = require('../utils/generateToken')
const Jwt = require('jsonwebtoken');

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
        if (!doesUserExist && await userCollection.matchPassword(password)) {
            throw new Error("Invalid email or password");
        } else {
            const { email: userEmail, _id} = doesUserExist;
            const refreshToken = createRefreshToken(userEmail, _id);
            //   doesUserExist.refreshToken = refreshToken;
            sendRefreshToken(res, refreshToken);
            req.refreshToken = refreshToken;
            
            const token = Jwt.sign({
                email: userEmail,
                userId: _id,
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });

            return res.send({
                message: "Sign in Successful",
                token
            });


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


module.exports = {
    registerUser,
    logout,
    getNewToken,
    loginUser,
    getUser
}