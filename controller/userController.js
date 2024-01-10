const {userCollection} = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const {registerSchema} = require('../middleware/validationSchema')
const { createRefreshToken, generateFreshToken, sendRefreshToken } = require('../utils/generateToken')

const registerUser = asyncHandler(async (req,res) => {
    const {firstName, surname, email, phone, password, referral} = req.body;
  try {
    registerSchema(req, res);
    const user = await userCollection.create({
        firstName,
        surname,
        email,
        phone,
        password,
        referral
    });
    res.status(201).json({userDetails: user});
  } catch (error) {
        res.send("could not create account because:", error.message);
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
})


const getNewToken = asyncHandler(async (req, res) => {
  generateFreshToken(req, res)
});


module.exports = {
    registerUser,
    logout,
    getNewToken,
    loginUser
}