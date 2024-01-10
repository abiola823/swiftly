const Jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


function isUserLoggedIn(req, res, next) {
    const authorizationHeader = req.headers.authorization || req.headers.Authorization;
  
    if(!authorizationHeader) {
      res.status(401).send("no-authorization-header");
      return;
    }
  
    const val = authorizationHeader.split(" ");
  
    const tokenType = val[0];
  
    const tokenValue = val[1];
  
    if(tokenType == "Bearer") {
      const decoded = Jwt.verify(tokenValue, process.env.ACCESS_TOKEN_SECRET);
      req.decoded = decoded;
      return next();
  
    } 
    return res.status(401).send("not-authorized");
  
  }


module.exports =  {
    isUserLoggedIn
    
  };