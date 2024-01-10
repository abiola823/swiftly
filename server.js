const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const path = require('path');
const db = require('./config/db');
const userRoute = require('./routes/userRoute');

db();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));







app.use('/api/user', userRoute);


app.listen(PORT, () => console.log(`server running on port ${PORT}`));