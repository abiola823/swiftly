const {
        registerUser,
        logout, 
        loginUser,
        getNewToken, 
        getUser,
        passwordReset,
        forgetPassword
} = require('../controller/userController');
const {isUserLoggedIn} = require('../middleware/middleware');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const router = express.Router();



router.post('/register', registerUser);

router.post('/logout', logout);

router.post('/login', loginUser);

router.post("/forget-password", forgetPassword);

router.put("/password-reset", passwordReset );

router.get('/refresh', getNewToken);

router.use(isUserLoggedIn);

router.get('/getUser/:id', getUser);







module.exports = router;