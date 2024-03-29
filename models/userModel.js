const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: true
        },

        surname: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        phone: {
            type: Number,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        referral: {
            type: String,
            required: false,
            default: "no"
        },


}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

const userCollection = mongoose.model('Users', userSchema);

module.exports = {userCollection};
