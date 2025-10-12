const passport = require("passport");
const Admin = require("../Models/Admin");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require("dotenv")
const User=require("../Models/User")
dotenv.config()

passport.use("google-admin",new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/admin/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            const user = await Admin.findOne({ email: profile.emails[0].value })
            if (user) {
                return cb(null, user)
            }
            console.log(profile)
            const newUser = await Admin.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            })
            return cb(null, newUser)
        } catch (err) {
            cb(err)
        }

    }
));

passport.use("google-user",new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/user/auth/google/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            const user = await User.findOne({ email: profile.emails[0].value })
            
            if (user) {
                
                return cb(null, user)
            }
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            })
          
            return cb(null, newUser)
        } catch (err) {
            cb(err)
        }

    }
));

passport.serializeUser(function (user, done) {
    done(null, user._id);
})
passport.deserializeUser(async function (id, done) {
    try {
        let user = await Admin.findById({ _id: id });
        done(null, user)
    } catch (err) {
        done(err)
    }
})

module.exports = passport