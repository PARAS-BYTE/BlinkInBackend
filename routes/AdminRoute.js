const Router = require("express").Router()
const AdminRoute = require("../controllers/AdminCont")
const ProductCont = require("../controllers/Product")
const CoupanRoute = require("../controllers/Coupans")
const passport = require("../middleware/Passport")


Router.post("/add", AdminRoute.adduser)
Router.post("/verfiyotp", AdminRoute.verifyuser)
Router.post("/login", AdminRoute.login)
Router.post("/createcoupan", AdminRoute.createcoupan)
Router.post("/sendverificationotp", AdminRoute.sendverificationotp)
Router.get("/getadmin", AdminRoute.getadmindetails)
Router.post("/update", AdminRoute.updateadmin)
Router.get("/getproducts", ProductCont.getadminproducts)
Router.post("/deleteproduct", ProductCont.removeproduct)
Router.get("/getcoupans", CoupanRoute.getcoupansadmin)
Router.post("/deletecoupan", CoupanRoute.deletecoupan)
Router.get("/getorders", AdminRoute.getorders)
Router.post("/updatestage", AdminRoute.updatestage)
Router.post("/coupanclaimers",AdminRoute.giveclaimers)
Router.get("/logout",AdminRoute.logout)


Router.get("/isauth", (req, res) => {
  if (req.session.admin) {
    return res.send({
      msg: true,
    })
  } else {
    return res.status(302).send({
      msg: false,
    })
  }
})

// Google Authentication
Router.get('/auth/google',
  passport.authenticate('google-admin', {
    scope: ['profile', 'email'],
    prompt: 'consent'
  }
  ));

Router.get('/auth/google/callback',
  passport.authenticate('google-admin', { failureRedirect: '/login' }),
  function (req, res) {
    req.session.admin = req.user
    // Successful authentication, redirect home.
    res.redirect("http://localhost:5173/admin/home")
  });



module.exports = Router