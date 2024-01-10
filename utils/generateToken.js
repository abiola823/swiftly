const Jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const {userCollection} = require('../models/userModel');
dotenv.config();



const createRefreshToken = (userEmail, _id, role) => {
    return Jwt.sign({
    email: userEmail,
    userId: _id,
    role }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  });
}

const sendRefreshToken = (res, token) => {
    return res.cookie('refreshToken', token, {
        httpOnly: true,
        //secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
}

const generateFreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
    // If we don't have a token in our request
    if (!token) return res.json({ accesstoken: 'no token found'});
    // We have a token, let's verify it!
    // console.log(token);
      const refreshToken = Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const foundUser = await userCollection.findOne({email: refreshToken.email});
    console.log(foundUser);
    if(!foundUser) return res.sendStatus(403);
      Jwt.verify(token, process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if(err || foundUser.email !== decoded.email) return res.sendStatus(403);
            const  accesstoken = Jwt.sign({
              email: decoded.email,
                userId: decoded._id,
                role: decoded.role
            }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5m'});
            res.json({accesstoken});
        })
    
    
   
}
module.exports = {
    createRefreshToken,
    sendRefreshToken,
    generateFreshToken
}