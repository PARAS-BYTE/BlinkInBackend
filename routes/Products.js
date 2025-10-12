const Router=require("express").Router()
const Product=require('../controllers/Product')

Router.post("/add",Product.addproduct)
Router.get("/all",Product.getProduct)
Router.get("/search",Product.searchproduct)
Router.get("/full",Product.getfullproduct)

module.exports=Router