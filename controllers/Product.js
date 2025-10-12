const Product = require("../Models/Product")
const Admin = require("../Models/Admin")

module.exports.addproduct = async (req, res, next) => {
    if (!req.session.admin) return res.status(400).json({ msg: "Login Your Self First Ofall" })
    try {
        const { name, quantity, price, imgurls, category, description } = req.body
        let some = await Product.create({
            name, quantity, price,
            seller: req.session.admin._id, category, imgurls,
            description
        })
        let user = await Admin.findOne({ _id: req.session.admin._id })
        user.products.push({
            id: some._id,
        })
        await user.save()

        res.status(200).send({
            msg: "Done",
        })
    } catch (err) {
        console.log(err)
        res.status(400).send({
            msg: "Failed Request"
        })
    }
}
module.exports.removeproduct = async (req, res, next) => {
    if (!req.session.admin) return res.status(400).send({ msg: "Login Yourself First" })
    try {
        let adminid = req.session.admin._id;
        const { id } = req.body
        let admin = await Admin.findOne({ _id: adminid })
        admin.products = admin.products.filter((sm) => sm.id != id)
        await admin.save()
        let data = await Product.deleteOne({ _id: id });
        return res.status(200).send({
            msg: "word Done",
        })

    } catch (err) {
        return res.status(400).send({
            msg: "Bad Request"
        })
    }
}

module.exports.getadminproducts = async (req, res) => {
    if (!req.session.admin) return res.status(400).json({ msg: "Login Yourself First" })
    try {
        let products = await Admin.findOne({ _id: req.session.admin._id }).populate("products.id", "name price quantity description imgurls category")
        return res.status(200).send({
            data: products.products
        })
    } catch (err) {
        return res.status(400).send({
            msg: "Eror at Getting Current Admin Products"
        })
    }
}

module.exports.getProduct = async (req, res, next) => {
    try {

        let data = await Product.find().populate("seller", "name email profileimg")
        return res.status(200).send(data)
    } catch (err) {
        return res.status(400).send({
            msg: "Failed to Get All Products"
        })
    }
}


module.exports.searchproduct = async (req, res) => {
    try {
        let { name } = req.query;
        let data = await Product.find({
            name: { $regex: name, $options: 'i' }
        }).populate("seller", "name email profileimg")
        let data2 = await Product.find({
            category: { $regex: name, $options: "i" }
        }).populate("seller", "name email profileimg")
        let data3=await Product.find({
            description:{$regex :name,$options:"i"}
        }).populate("seller","name email profileimg")
        let combined=[...data,...data2,...data3]
        let unique = Array.from(new Map(combined.map(item => [item._id.toString(), item])).values())
        return res.status(200).send(unique)
    } catch (err) {
        console.log(err)
        return res.status(400).send({
            msg: "Failed to due to some eror"
        })
    }
}

module.exports.getfullproduct = async (req, res) => {
   
    try {
        let { id } = req.query;
        let data  = await Product.findById(id).populate("seller", "name profileimg")
        return res.send(data)
    } catch (err) {
        return res.status(400).send({
            msg: 'Problem Occured'
        })
    }
}