const mongoose = require("mongoose")
const { Schema } = mongoose


const AdminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        // required: true,
    },
    mobileNumber: Number,
    ship: {
        district: String,
        pincode: Number,
        state: String,
        country: String,
        location: String,
    },
    googleId: String,
    products: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            }
        }
    ],
    coupans: [
        {
            coupan: {
                type: Schema.Types.ObjectId,
                ref: "Coupan"
            }
        }
    ],
    otpd: {
        otp: String,
        expired: Date,
    },
    profileimg: String,
    verified: {
        type: Boolean,
        default: false,
    },
    totalincome: {
        type: Number,
        default: 0,
    },
    coupanspend:{
        type:Number,
        default:0,
    },
    orders: [
        {
            order:{
                type:Schema.Types.ObjectId,
                ref:"Order"
            }
        }
    ],
})

module.exports = mongoose.model("Admin", AdminSchema)