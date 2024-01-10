 const mongoose = require('mongoose');
 const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }, 

    productName: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },
 }, {
    timestamps: true
 });
 
 const orderCollection = mongoose.model('order', orderSchema);

 module.exports = orderCollection;