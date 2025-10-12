const nodemailer = require("nodemailer")
const User = require("../Models/User")
const sendotp = require("../middleware/SendOtp")
const bcrypt = require("bcrypt")
const Product = require("../Models/Product")
// const { useImperativeHandle } = require("react")
const Coupan = require("../Models/Coupans")
const { sendordermailtoadmin, coupanused } = require("../middleware/AddOrder")
const Orders = require("../Models/Orders")
const Admin = require("../Models/Admin")
const Coupans = require("../Models/Coupans")


const saltrounds = 10

module.exports.adduser = async (req, res, next) => {
   try {
      const { name, email, password } = req.body;
      const data = await User.findOne({ email });
      if (data) {
         // console.log(data)
         return res.send({
            msg: "User Already Exist",
            val: data,
         })
      }
      await bcrypt.hash(password, saltrounds, async (err, hash) => {
         let newuser = await User.create({
            name, email, password: hash,
         })

         await sendotp.sendotp(email, false);
         res.send({
            email,
         })
      })
   } catch (err) {
      console.log(err)
      return res.status(400).json({ msg: "Failed", err })
   }
}

module.exports.verifyuser = async (req, res) => {
   console.log("REached here")
   try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email })
      if (Date.now() > user.otpd.expired) {
         return res.status(302).json({
            msg: "Time gone"
         })
      } else if (user.otpd.otp != otp) {
         return res.status(302).json({
            msg: "Wrong Otp"
         })
      } else {
         user.verified = true,
            user.otpd = {
               otp: "",
               Date: Date.now()
            }
         user.save()
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
module.exports.sendverificationotp = async (req, res) => {
   try {
      let { email } = req.body;
      await sendotp.sendotp(email, false)
      res.status(200).send({
         msg: "Otp Sent Succefyllyt"
      })

   } catch (err) {
      res.status(400).send({
         msg: "Eror in Verfication of the otp ",
      })
   }
}

module.exports.login = async (req, res) => {
   try {
      let { email, password } = req.body
      let user = await User.findOne({ email })
      if (!user) {
         return res.status(302).json({
            msg: "User Does't Exist",
         })
      }
      if (!user.verified) {
         return res.status(302).json({
            msg: "Not Verified"
         })
      }
      bcrypt.compare(password, user.password, (err, succ) => {
         if (succ) {
            req.session.user = user
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


// Deleting Data from Database cart 
async function removefromcart(req, res) {
   try {
      let { id } = req.body;
      let product = await Product.findById(id);

      let email = req.session.user.email
      let user = await User.findOne({ email });
      let nu = 0;
      let newdata = user.cart.filter((d) => {
         if (d.id != id) return true
         else {
            nu = d.quantity
            return false;
         }
      })
      user.cart = newdata
      user.totalprice -= (nu * product.price)
      await user.save()
      return res.status(200).send({
         msg: "Done Succefully",
         data: user,
      })


   } catch (err) {
      console.log(err)
      res.status(400).send({
         msg: "Code Ended due to some erors",
      })
   }
}


module.exports.addtocart = async (req, res) => {
   if (!req.session.user) {
      return res.status(400).send({
         msg: "Login YourSelf First "
      })
   }
   try {

      let { id } = req.body;

      let product = await Product.findById(id);
      if (product.quantity <= 0) {
         res.status(302).send({
            msg: "Out of Stock"
         })
      } else {

         let email = req.session.user.email
         let user = await User.findOne({ email });

         // Checking if doesn't exist already 
         let some = user.cart.find(s => s.id == id)
         if (some) {
            return res.status(400).send({
               msg: "Already in the Cart"
            })
         }
         user.cart.push({
            id,
            quantity: 1,
         })

         user.totalprice += product.price
         await user.save()
         return res.status(200).send({
            msg: "Done Succefully",
         })
      }

   } catch (err) {
      console.log(err)
      res.status(400).send({
         msg: "Code Ended due to some erors",
      })
   }
}

module.exports.decreasequantity = async (req, res) => {
   // await removefromcart(req, res)
   try {
      let { id } = req.body;
      let product = await Product.findById(id);

      let email = req.session.user.email
      let user = await User.findOne({ email });
      // let newdata = user.cart.map(d => d.id != id ? d : { ...d, quantity: d.quantity + 1 })
      let item = user.cart.find(d => d.id.toString() === id);
      if (item.quantity <= 1) {
         user.cart = user.cart.filter(d => d.id != id)
      } else {
         user.cart = user.cart.map(d => d.id != id ? id : { ...d, quantity: d.quantity - 1 })
      }
      user.totalprice -= product.price
      await user.save()
      return res.status(200).send({
         msg: "Done Succefully",
         data: user,
      })


   } catch (err) {
      console.log(err)
      res.status(400).send({
         msg: "Code Ended due to some erors",
      })
   }
}

module.exports.increasequantity = async (req, res) => {
   try {
      let { id } = req.body;
      let product = await Product.findById(id);

      let email = req.session.user.email
      let user = await User.findOne({ email });
      let newdata = user.cart.map(d => d.id != id ? d : { ...d, quantity: d.quantity + 1 })
      user.totalprice += product.price
      user.cart = newdata
      await user.save()
      return res.status(200).send({
         msg: "Done Succefully",
         data: user,
      })


   } catch (err) {
      console.log(err)
      res.status(400).send({
         msg: "Code Ended due to some erors",
      })
   }
}


// Geting Whole Cart
module.exports.getcart = async (req, res) => {
   if (!req.session.user) {
      return res.status(400).send({
         msg: "Login YourSelf First"
      })
   }
   try {
      let id = req.session.user._id
      let user = await User.findById(id).populate("cart.id", "name price imgurls category")
      res.status(200).json({
         data: user.cart,
         total: user.totalprice
      })
   } catch (err) {
      console.log(err)
      res.status(400).send({
         msg: "Eror at Getting Cart ",
         err: err.message,
      })
   }
}



// Buy Cart
module.exports.buycart = async (req, res) => {
   let totalamount = 0;
   try {
      if (!req.session.user) {
         return res.status(400).send({
            msg: 'Login First of all',
         })
      }
      let user = await User.findOne({ _id: req.session.user._id })
      let discount = 0;
      let { code } = req.body
      if (code) {
         let some = await Coupans.findOne({ name: code })
         if (!some) {
            return res.status(400).send({
               msg: "No Such Coupan Exist",
            })
         }
         if (some.numbers < 1) {
            return res.status(400).send({
               msg: "Coupan's Limit Completed"
            })
         }
         if (some.expire < Date.now()) {
            return res.status(400).send({
               msg: "Coupan Expired",
            })
         }
         if (some.limit > user.totalprice) {
            return res.status(400).send({
               msg: `Insufficient Amount to Claim Coupan `
            })
         }
         discount = some.off
         await coupanused(some.seller, user.name, user.email, user.mobileNumber, discount)
         some.users.push({
            user: user._id
         })
         some.numbers -= 1
         some.save()
      }

      for (let el of user.cart) {
         let seller = await Product.findOne({ _id: el.id })
         seller.quantity -= el.quantity;
         let seller_id = seller.seller
         let product_id = el.id
         let user_id = user._id
         let some = await Orders.create({
            product: product_id,
            price: seller.price,
            quantity: el.quantity,
            seller: seller_id,
            user: user_id,
            stage: "Ordered",
            date: Date.now()
         })
         totalamount += (seller.price * el.quantity)
         // Now i have to add the thsi order to the user's order too and the seller of this too
         await seller.save()
         user.orders.unshift({
            order: some._id,
         })
         await user.save()
         prd = await Admin.findOne({ _id: seller_id })
         prd.orders.unshift({
            order: some._id,
         })
         prd.totalincome += (((seller.price * el.quantity) / 100) * 93)
         await prd.save()
         await sendordermailtoadmin(prd.email, user.address, user.mobileNumber, seller.name, el.quantity, user.name)
      }
      // await createorder(user.cart, user._id, user.address)

      user.cart = []
      user.totalprice = 0
      await user.save()
      return res.send({
         msg: 'Done Without Any Eror',
         price: totalamount,
         discount,
         nobleprice: totalamount - discount,
      })
   } catch (err) {
      console.log(err)
      return res.status(400).send({
         msg: "Wrong Credentials"
      })
   }

}

// Removing a Particular Product from cart
module.exports.removecart = async (req, res) => {
   await removefromcart(req, res)
}

// Adding Address via post requrest 
module.exports.addadress = async (req, res) => {
   let id = req.session.user._id
   try {
      let { mobileNumber, district, country, pincode, state, location } = req.body
      let user = await User.findById(id)
      if (!user) {
         return res.status(302).send({ msg: "Failed to fetch User Login Your Self Again to go futer" })
      }

      await user.addresses.push({
         mobileNumber,
         district,
         state,
         pincode,
         country,
         location,
      })
      await user.save()
      return res.status(200).send({
         msg: "Done Succefully",
         data: user.addresses,
      })
   } catch (err) {
      return res.status(400).send({
         msg: "Eror Occured at Adding Address Page",
         err: err.message,
      })
   }
}


module.exports.updateAdress = async (req, res) => {
   let { id, mobileNumber, district, pincode, state, country, location } = req.body
   let userid = req.session.user._id
   try {
      let some = await User.updateOne({
         _id: userid,
         "addresses._id": id,
      },
         {
            $set: {
               "addresses.$.mobileNumber": mobileNumber,
               "addresses.$.district": district,
               "addresses.$.pincode": pincode,
               "addresses.$.state": state,
               "addresses.$.country": country,
               "addresses.$.location": location,
            }
         }
      )
      return res.status(200).send({
         msg: some
      })
   } catch (err) {
      return res.status(400).send({
         msg: "ERro r",
         err: err.message,
      })
   }
}


// Update Profile

module.exports.profileupdate = async (req, res) => {
   console.log('Reached here to Update Profile')
   if (!req.session.user) {
      return res.status(400).send({
         msg: "Login First"
      })
   }
   try {
      let { name, profileimg, mobileNumber, addresses } = req.body;
      // console.log(req.body)
      let id = req.session.user._id;
      let some = await User.updateOne(
         {
            _id: id,
         },
         {
            $set: {
               name,
               profileimg,
               mobileNumber,
               address: addresses,
            }
         }
      )
      req.session.user = await User.findOne({ _id: req.session.user._id })
      return res.status(200).send({
         msg: "Profile Updated Successfully"
      })

   } catch (err) {
      return res.status(400).send({
         msg: "Err in Updating Profile",
         err: err.message,
      })
   }
}

module.exports.isauth = (req, res) => {
   if (req.session.user) {
      return res.send({
         msg: true,
      })
   } else {
      return res.send({
         msg: false
      })
   }
}

module.exports.getprofile = async (req, res) => {
   try {
      if (!req.session.user) {
         return res.status(400).send({
            msg: "Login First"
         })
      }
      let user = await User.findById(req.session.user._id)
      return res.send({
         name: user.name,
         profileimg: user.profileimg,
         mobileNumber: user.mobileNumber,
         address: {
            district: user.address.district,
            pincode: user.address.pincode,
            state: user.address.state,
            location: user.address.location,
            country: user.address.country,
            type: user.address.type
         },
      })
   } catch (err) {
      return res.status(400).send({
         msg: "Err",
         err: err.message
      })
   }
}


module.exports.getorders = async (req, res) => {
   try {
      if (!req.session.user) {
         return res.send({
            msg: "Login yourself First",
         })
      }
      let user = await User.findOne({ _id: req.session.user._id })
         .populate({
            path: 'orders.order',
            populate: [
               {
                  path: 'product',
                  select: 'name description imgurls',
                  model: 'Product'
               },
               {
                  path: 'seller',
                  select: 'name profileimg'
                  , model: 'Admin'
               },
            ]
         });
      console.log(user.orders)
      return res.send({
         data: user.orders
      })
   } catch (err) {
      return res.status(400).send({
         msg: "Wrong Credentials",
      })
   }
}

module.exports.logout = (req, res) => {
   req.session.user = null
   return res.send({
      msg: "Logged Out",
   })
}