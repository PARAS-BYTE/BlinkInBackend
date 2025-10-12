const mongoose=require("mongoose")
const {Schema}=mongoose


const OrderSchema=new Schema({
    product:{
        type:Schema.Types.ObjectId,
    },
    quantity:Number,
    price:Number,
    seller:{
        type:Schema.Types.ObjectId,
    },
    user:{
        type:Schema.Types.ObjectId,
    },
    stage:String,
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model("Order",OrderSchema);