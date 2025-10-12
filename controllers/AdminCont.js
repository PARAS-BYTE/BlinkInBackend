const nodemailer = require("nodemailer")
const Admin = require("../Models/Admin")
const sendotp = require("../middleware/SendOtp")
const bcrypt = require("bcrypt")
const saltrounds = 10
const Coupan = require("../Models/Coupans")
const User = require("../Models/User")
const Orders = require("../Models/Orders")
const { updatestaus } = require("../middleware/AddOrder")
const Coupans = require("../Models/Coupans")

module.exports.adduser = async (req, res, next) => {
   try {
      const { name, email, password } = req.body;
      console.log(req.body)
      const data = await Admin.findOne({ email });
      if (data) {
         return res.status(302).send({
            msg: "Admin Already Exist",
            val: data,
         })
      }
      await bcrypt.hash(password, saltrounds, async (err, hash) => {
         let newuser = await Admin.create({
            name, email, password: hash,
         })
         await sendotp.sendotp(email, true);
         res.status(200).send({
            email,
         })
      })
   } catch (err) {
      console.log(err)
      return res.status(400).json({ msg: "Failed", err })
   }
}


// Sending Re-Verification Link
module.exports.sendverificationotp = async (req, res) => {
   try {
      let { email } = req.body;
      await sendotp.sendotp(email, true)
      res.status(200).send({
         msg: "Otp Sent Succefyllyt"
      })

   } catch (err) {
      res.status(400).send({
         msg: "Eror in Verfication of the otp ",
      })
   }
}

module.exports.verifyuser = async (req, res) => {
   console.log("REquest REached here")
   try {
      const { email, otp } = req.body;
      const user = await Admin.findOne({ email })
      if (Date.now() > user.otpd.expired) {
         return res.status(302).json({
            msg: "Time gone"
         })
      } else if (user.otpd.otp != otp) {
         return res.status(400).json({
            msg: "Wrong Otp"
         })
      } else {
         user.verified = true,
            user.otpd = {
               otp: "",
               Date: Date.now()
            }
         await user.save()
         return res.status(200).json({
            msg: "Verified",
         })
      }
   } catch (err) {
      console.log(err)
      res.status(400).json({
         msg: "Code Ended With Erors",
         err
      })
   }
}



module.exports.login = async (req, res) => {
   try {
      let { email, password } = req.body
      let user = await Admin.findOne({ email })

      if (!user) {
         return res.status(302).json({
            msg: "Admin Does't Exist",
         })
      }
      if (!user.verified) {
         return res.status(302).json({
            msg: "Not Verified"
         })
      }
      bcrypt.compare(password, user.password, (err, succ) => {
         if (succ) {
            req.session.admin = user;
            return res.status(200).json({
               msg: "Verfied",
            })
         } else {
            return res.status(302).json({
               msg: "Wrong Password",
            })
         }
      })
   } catch (err) {
      return res.status(400).json({
         msg: err.message,
      })
   }
}





// Coupan Creation 
module.exports.createcoupan = async (req, res) => {
   try {
      if (!req.session.admin) {
         return res.status(400).send({
            msg: "Login First To Create Coupan ",
         })
      }
      let { name, off, limit, numbers, expire } = req.body
      let some = await Coupan.findOne({ name })
      if (some) {
         return res.status(302).send({
            msg: "Coupan Name Already Exist"
         })
      }
      let coupan = await Coupan.create({
         name, off, limit, numbers,
         expire: Date.now() + expire * 60 * 60 * 1000,
         seller: req.session.admin._id,
      })
      let admin = await Admin.findById(req.session.admin._id);
      admin.coupans.push({
         coupan: coupan._id,
      })
      await admin.save()
      return res.status(200).send({
         coupan: name,
         msg: "Succefully Created the Coupan"
      })
   } catch (err) {
      console.log(err)
      res.status(300).send({
         msg: "Coupan Creation Failed"
      })
   }

}

module.exports.updateadmin = async (req, res) => {
   let { name, mobileNumber, profileimg, district, ship } = req.body

   try {
      if (!req.session.admin) {
         return res.status(302).send({
            msg: "Login First"
         })
      }
      let data = await Admin.updateOne(
         {
            _id: req.session.admin._id,
         },
         {
            $set: {
               name,
               mobileNumber,
               profileimg,
               ship,
            }
         })
      let some = await Admin.findOne({ _id: req.session.admin._id })
      req.session.admin = some
      return res.status(200).send({
         msg: "Updated Succefully"
      })
   } catch (err) {
      console.log(err)
      return res.status(302).send({
         msg: "Failed to Update the Admin id"
      })
   }
}

module.exports.getadmindetails = async (req, res, next) => {


   if (req.session.admin) {
      let admin = await Admin.findOne({ _id: req.session.admin._id })
      return res.status(200).send({
         name: admin.name,
         profileimg: admin.profileimg,
         email: admin.email,
         totalincome: admin.totalincome,
         verified: admin.verified,
         ship: admin.ship,
         mobileNumber: admin.mobileNumber
      })
   } else {
      return res.status(302).send("Please Login First")
   }
}


module.exports.getorders = async (req, res) => {
   try {
      if (!req.session.admin) {
         return res.send({
            msg: "Login yourself First",
         })
      }
      let admin = await Admin.findOne({ _id: req.session.admin._id })
         .populate({
            path: 'orders.order',
            populate: [
               {
                  path: 'product',
                  select: 'name description imgurls',
                  model: 'Product'
               },
               {
                  path: 'user',
                  select: 'name profileimg address mobileNumber'
                  , model: 'User'
               },
            ]
         });
      // console.log(admin.orders)
      return res.send({
         data: admin.orders
      })
   } catch (err) {
      console.log(err)
      return res.status(400).send({
         msg: "Wrong Credentials",
      })
   }
}


const orderStages = {
   Ordered: "Processing",
   Processing: "Packed",
   Packed: "Shipped",
   Shipped: "Out for Delivery",
   "Out for Delivery": "Delivered",
   Delivered: "Completed",

};



module.exports.updatestage = async (req, res) => {
   try {
      if (!req.session.admin) {
         return res.status(400).send({
            msg: "Login Your Self first"
         })
      }
      let { id } = req.body
      let order = await Orders.findOne({ _id: id })

      if (!orderStages[order.stage]) {
         return res.status.send({
            msg: "Completed Already"
         })
      }
      order.stage = orderStages[order.stage];
      await order.save()
      await updatestaus(order.user, order.product, order.quantity, order.stage)
      return res.send({
         msg: "Updated"
      })
   } catch (err) {
      console.log(err)
      return res.status(400).send({
         msg: "Eror",
         err: err.message,
      })
   }
}



module.exports.giveclaimers = async (req, res) => {
   try {
      if (!req.session.admin) {
         return res.send({
            msg: "Loginf First"
         })
      }
      let { id } = req.body
      let some = await Coupans.findOne({ _id: id }).populate("users.user", "name email profileimg")
      return res.send(some)
   } catch (err) {
      return res.send({ msg: "Errr", err: err.message })
   }
}
module.exports.logout = async (req, res) => {
   req.session.admin = null
   return res.send({
      msg: "done"
   })
}