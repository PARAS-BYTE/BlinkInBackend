const Admin = require("../Models/Admin")
const Product = require("../Models/Product")
const User = require("../Models/User")
// const testmain = await nodemailer.createTestAccount()
const {Resend}=require("resend")
const resend=new Resend(process.env.RESEND_API_KEY)



function formatAddressForEmail(address) {
  if (!address) {
    return 'No address provided.';
  }
  // Build the address line by line, handling missing fields
  let addressHtml = '';
  if (address.location) addressHtml += `${address.location}<br>`;
  if (address.district) addressHtml += `${address.district}, `;
  if (address.state) addressHtml += `${address.state} `;
  if (address.pincode) addressHtml += `- ${address.pincode}<br>`;
  if (address.country) addressHtml += `${address.country}<br>`;
  if (address.type?.type) addressHtml += `(${address.type.type} Address)`;

  return addressHtml;
}
async function sendordermailtoadmin(email, address, mobilenumber, productname, qunantity, username) {
  try {
    let add
    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>You've Received a New Order!</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f8f9fa;
        color: #212529;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 12px;
        padding: 40px;
      }
      .header {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 25px;
        text-align: center;
        color: #000;
      }
      .section {
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 8px;
        margin-bottom: 15px;
      }
      .section p {
        font-size: 16px;
        line-height: 1.6;
        margin: 5px 0;
      }
      .section b {
        color: #000;
        font-weight: 600;
      }
      .footer {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin-top: 30px;
        border-top: 1px solid #e9ecef;
        padding-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">You've Got a New Order!</div>

      <div class="section">
        <div class="section-title">Order Details</div>
        <p><b>Product:</b> ${productname}</p>
        <p><b>Quantity:</b> ${qunantity}</p>
      </div>

      <div class="section">
        <div class="section-title">Customer Details</div>
        <p><b>Name:</b> ${username}</p>
        <p><b>Mobile:</b> ${mobilenumber}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Shipping Address</div>
        <p>${formatAddressForEmail(address)}</p>
      </div>

      <div class="footer">
        <p>This automated message was sent from Blikin Ecommerce. Please process this order promptly.</p>
      </div>
    </div>
  </body>
  </html>
  `;
    await resend.emails.send({
      from: "BlinkIn <onboarding@resend.dev>",
      to: email,
      subject: `New Order Received for ${productname}`,
      html: htmlContent,
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
    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Order Status Has Been Updated</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f8f9fa;
        color: #212529;
      }
      .container {
        max-width: 550px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 40px;
      }
      .header {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 25px;
        text-align: center;
      }
      .status-box {
        background-color: #f1f3f5;
        border-radius: 4px;
        padding: 15px;
        text-align: center;
        margin: 25px 0;
      }
      .status-text {
        font-size: 18px;
        font-weight: 600;
        color: #000000;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
        margin: 10px 0;
      }
      .footer {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Your Order Has Been Updated!</div>
      <div class="content">
        <p>Hello <b>${userName}</b>,</p>
        <p>This is a notification regarding your recent order on Blikin Ecommerce.</p>
        <p><b>Product:</b> ${productName}<br><b>Quantity:</b> ${quantity}</p>
        <div class="status-box">
          <p style="margin: 0; font-size: 14px; color: #495057;">New Order Status:</p>
          <p class="status-text">${stage}</p>
        </div>
        <p>We will notify you again as your order progresses. Thank you for shopping with us!</p>
      </div>
      <div class="footer">
        <p>This is an automated notification. Please do not reply to this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    await resend.emails.send({
      from: "BlinkIn <onboarding@resend.dev>",
      to: user.email,
      subject: `Your Order for ${productName} has been ${stage}`,
      html: htmlContent
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
    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>A Coupon Was Claimed</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f8f9fa;
        color: #212529;
      }
      .container {
        max-width: 550px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 40px;
      }
      .header {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 25px;
        text-align: center;
      }
      .content p {
        font-size: 16px;
        line-height: 1.6;
        margin: 10px 0;
      }
      .content b {
        color: #000000;
      }
      .footer {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">Coupon Claimed!</div>
      <div class="content">
        <p>Hello <b>${seller.name}</b>,</p>
        <p>Great news! Your coupon has been successfully claimed by a user. Here are the details:</p>
        <p><b>User Name:</b> ${username}</p>
        <p><b>User Email:</b> ${useremail}</p>
        <p><b>User Mobile:</b> ${userMobilenumber}</p>
      </div>
      <div class="footer">
        <p>This is an automated notification from Blikin Ecommerce.</p>
      </div>
    </div>
  </body>
  </html>
  `;

    await resend.emails.send({
      to: seller.email,
      from: "BlinkIn <onboarding@resend.dev>",
      subject: `Your Coupan is Claimed`,
      html: htmlContent
    })

  } catch (Err) {
    console.log(Err)
  }
}
module.exports.coupanused = coupanused