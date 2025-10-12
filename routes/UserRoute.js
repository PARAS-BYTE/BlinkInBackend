const Router = require("express").Router()
const UserCont = require("../controllers/UserCont")
const passport = require("../middleware/Passport")

Router.post("/signup", UserCont.adduser)
Router.post("/verfiyotp", UserCont.verifyuser)
Router.post("/login", UserCont.login)
Router.post("/addtocart", UserCont.addtocart)
Router.post("/sendcode", UserCont.sendverificationotp)
Router.post("/decrease", UserCont.decreasequantity);
Router.post("/increase", UserCont.increasequantity)
Router.get("/getcart", UserCont.getcart)
Router.post("/buycart", UserCont.buycart)
Router.post("/removefromcart", UserCont.removecart)
Router.post("/addadress", UserCont.addadress)
Router.post("/updateaddress", UserCont.updateAdress)
Router.post("/updateProfile", UserCont.profileupdate)
Router.get("/getprofile", UserCont.getprofile)
Router.get("/getorders", UserCont.getorders)
Router.get("/logout", UserCont.logout)
Router.get("/isauth", UserCont.isauth)


Router.get('/auth/google',
  passport.authenticate('google-user', {
    scope: ['profile', 'email'],
    prompt: 'consent'
  }
  ));

Router.get('/auth/google/callback',
  passport.authenticate('google-user', { failureRedirect: '/login' }),
  function (req, res) {
    console.log("User page")
    req.session.user = req.user
    // Successful authentication, redirect home.
    res.redirect("http://localhost:5173/user")
  });




module.exports = Router