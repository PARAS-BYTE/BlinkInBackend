const mongoose = require("mongoose")
const { Schema } = mongoose


const UserSchema = new Schema({
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
    address: {
        district: String,
        pincode: Number,
        state: String,
        country: String,
        location: String,
        type: {
            type: String,
            default: 'Home'
        },
    },
    googleId: String,
    profileimg: String,
    verified: {
        type: Boolean,
        default: false,
    },
    otpd: {
        otp: String,
        expired: Date,
    },
    spends: {
        type: Number,
        default: 0,
    },
    cart: [
        {
            id: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: Number,
        }
    ],
    totalprice: {
        type: Number,
        default: 0,
    },
    coupanclaimed: {
        type: Number,
        default: 0,
    },
    orders: [
        {
            order: {
                type: Schema.Types.ObjectId,
                ref: "Order"
            }
        }
    ]
})

module.exports = mongoose.model("User", UserSchema)