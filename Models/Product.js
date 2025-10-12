const mongoose = require("mongoose")
const { Schema } = mongoose


const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
    },
    description: {
        type: String,

    },
    price: {
        type: Number,
        required: true,
    },
    seller: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Admin"
    },
    imgurls: [
        { img: String }
    ],
    category: {
        required: true,
        type: String,
    },

})

module.exports = mongoose.model("Product", ProductSchema)