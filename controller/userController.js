const {userCollection} = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const {registerSchema} = require('../middleware/validationSchema')
const { createRefreshToken, generateFreshToken, sendRefreshToken } = require('../utils/generateToken')

const registerUser = asyncHandler(async (req,res) => {
    const {firstName, surname, email, phone, password, referral} = req.body;
  try {
    const doesUserExist = await userCollection.find({email});
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
   return res.status(201).json({userDetails: user});
  } catch (error) {
        res.send(`could not create account because: ${error.message}`);
  }

});

const loginUser = asyncHandler(async (req,res) => {
    try {
        const { email, password } = req.body;
        const doesUserExist = await userModel.findOne({ email });
        if (!doesUserExist && await userModel.matchPassword(password)) {
            throw new Error("Invalid email or password");
        } else {
            const { email: userEmail, _id, role } = doesUserExist;
            const refreshToken = createRefreshToken(userEmail, _id, role);
            //   doesUserExist.refreshToken = refreshToken;
            sendRefreshToken(res, refreshToken);
            req.refreshToken = refreshToken;
            
            const token = Jwt.sign({
                email: userEmail,
                userId: _id,
                role
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
            if(findUser) return res.json({userDetails: findAllUser})

});

const getAllUser = asyncHandler(async (req, res) => {
    const findAllUser = await userCollection.find();
    res.send({AllUsers: findAllUser})
});

const getNewToken = asyncHandler(async (req, res) => {
  generateFreshToken(req, res)
});


module.exports = {
    registerUser,
    logout,
    getNewToken,
    loginUser,
    getAllUser,
    getUser
}