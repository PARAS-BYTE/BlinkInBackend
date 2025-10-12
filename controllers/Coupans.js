const Admin = require("../Models/Admin")
const Coupans = require("../Models/Coupans")


module.exports.getcoupansadmin = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.status(400).send({
                msg: "Login First"
            })
        }
        let some = await Admin.findById(req.session.admin._id).populate("coupans.coupan", "name off limit numbers expire")
        return res.send(some.coupans)
    } catch (err) {
        console.log(err)
        res.status(400).send({
            msg: "Done Without Erors"
        })
    }
}




module.exports.deletecoupan = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.status(400).send({
                msg: "Login First"
            })
        }
        let { id } = req.body
        let admin = await Admin.findOne({ _id: req.session.admin._id });
        admin.coupans = admin.coupans.filter(s => s.coupan != id)
        admin.save()
        await Coupans.deleteOne({ _id: id })
        return res.send({
            msg: "Work Done",
        })

    } catch (err) {
        
        return res.status(400).send({
            msg: "Eror",
            err: err.message
        })
    }
}