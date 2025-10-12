const Admin = require("../Models/Admin")
const Product = require("../Models/Product")
const User = require("../Models/User")
const nodemailer = require("nodemailer")


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:
    {
        user: "raghavji014@gmail.com",
        pass: "esvz nlcv slax cysv",
    }
})

// [
//   {
//     id: {
//       _id: new ObjectId('68de3c24b38373e2763d9805'), : Product Id 
//       name: 'I phone 16 pro max',                    
//       price: 2200,                                      
//       seller: new ObjectId('68de352cb10e09b3566e4ca6'), : Seller Id
//       imgurls: 'https://unsplash.com/photos/a-cell-phone-with-a-colorful-background-R8Pgjgqw8aw'
//     },
//     quantity: 1,
//     _id: new ObjectId('68dec2053f0dd13a36689c67')
//   }
// ]

// await sendordermailtoadmin(prd.email, user.address, user.mobileNumber, seller.name, el.quantit


// await transporter.sendMail({
//             from: "raghavji014@gmail.com",
//             to: email,
//             subject :'one time password',
//             text: `Your Otp is ${otp}`
//         })
async function sendordermailtoadmin(email, address, mobilenumber, productname, qunantity, username) {
    try {
        let add
        await transporter.sendMail({
            from: "raghavji014@gmail.com",
            to: email,
            subject: "New Order Recieved Via BlinkIn",
            text: `
            You Recieved an order of the your product :
            ${productname} and with qunatity of ${qunantity}
            by a user name : ${username}     and having user details are
            address : ${JSON.stringify(address)}
            with mobile numbeer ${mobilenumber} 
            `
        })
    } catch (err) {
        console.log(err)
    }
}
module.exports.sendordermailtoadmin = sendordermailtoadmin



async function updatestaus(userid, productid, quantity, stage) {
    try {
        let user = await User.findById(userid)
        let product = await Product.findById(productid)
        await transporter.sendMail({
            from: "raghavji014@gmail.com",
            to: user.email,
            subject: 'Your Order Status Updated',
            text: `
                Hey User ${user.name}
                As you have ordered a order 
                ${product.name} of quantity ${quantity} 
                its order stage is updated to the ${stage}
                Just Keep Updated with Us
            `
        })
    } catch (err) {
        console.log(err)
    }
}
module.exports.updatestaus = updatestaus

// await coupanused(some.seller, user.name, user.email)
async function coupanused(sellerid, username, useremail, userMobilenumber, discount) {
    try {
        let seller = await Admin.findById(sellerid)
        seller.coupanspend += discount
        seller.save()
        await transporter.sendMail({
            to: seller.email,
            from: "raghavji014@gmail.com",
            subject: `Your Coupan is Claimed`,
            text: `
                Hey seller  ${seller.name}
                <br/>
                Your Coupan is used by a user ${username}
                and mobile and emali of user are : ${userMobilenumber}
                adn ${useremail}
            `
        })

    } catch (Err) {
        console.log(Err)
    }
}
module.exports.coupanused = coupanused