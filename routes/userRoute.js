const {registerUser,logout, loginUser, getNewToken} = require('../controller/userController');
const {isUserLoggedIn} = require('../middleware/middleware');
const express = require('express');
const router = express.Router();


router.post('/register', registerUser);

router.post('/logout', logout);

router.post('/login', loginUser);

router.get('/refresh', getNewToken);




module.exports = router;