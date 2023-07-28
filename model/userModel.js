const mongoose = require("mongoose")

const registrationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rePassword: {
        type: String,
        required: true
    },
    block: {
        type: Boolean,
       default:false
    },
    imageUrl: {
        type: Array
    },
    wallet: {
        type: Number,
        default: 0
    },
    isAdmin :{
        type :Boolean,
        default : false
    }

} )

 const collection = mongoose.model("userCollection", registrationSchema)

module.exports = collection