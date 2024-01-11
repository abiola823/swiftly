const {registerUser,logout, loginUser, getNewToken, getAllUser} = require('../controller/userController');
const {isUserLoggedIn, adminsOnly} = require('../middleware/middleware');
const express = require('express');
const router = express.Router();


router.post('/register', registerUser);

router.post('/logout', logout);

router.post('/login', loginUser);

router.get('/refresh', getNewToken);

router.use(isUserLoggedIn);

router.get('getUser');






module.exports = router;