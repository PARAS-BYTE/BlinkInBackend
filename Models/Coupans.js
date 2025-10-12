const mongoose = require("mongoose")
const { Schema } = mongoose


const CoupanSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    expire: {
        type: Date,
        require: true,
    },
    numbers: {
        type: Number,
        required: true,
    },
    off: {
        type: Number,
        required: true
    },
    limit:{
        type:Number,
        required:true,
    },
    seller: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    users: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ]

})

module.exports = mongoose.model("Coupan", CoupanSchema)