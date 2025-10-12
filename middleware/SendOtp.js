const crypto = require("crypto")
const User = require("../Models/User")
const nodemailer=require("nodemailer")
const Admin=require("../Models/Admin")




const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:
    {
        user: "raghavji014@gmail.com",
        pass: "esvz nlcv slax cysv",
    }
})
transporter.verify((err, succ) => {
    if (!err) {
        console.log('Nodemailer is Ready to send Mails')
    }
})
module.exports.sendotp =async (email,isadm) => {
    try{

        const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
        let user
        if(!isadm){
             user=await User.findOne({email})
        }else{
            user=await Admin.findOne({email})
        }
        user.otpd.otp=otp,
        user.otpd.expired=Date.now()+5*60*1000,
        await user.save()
        await transporter.sendMail({
            from: "raghavji014@gmail.com",
            to: email,
            subject :'one time password',
            text: `Your Otp is ${otp}`
        })
        
        return true
    }catch(err){
        console.log('Eror is here',err)
        return false
    }
}