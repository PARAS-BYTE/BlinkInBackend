const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const cors = require("cors");
const crypto=require("crypto")
const cloudinary=require("cloudinary")
const helmet=require("helmet")
const UserRouter = require("./routes/UserRoute.js");
const AdminRouter = require("./routes/AdminRoute.js");
const ProductRouter = require("./routes/Products.js");

dotenv.config();
const app = express();
// Confirutring Cloudinary
cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key :process.env.API_KEY,
  api_secret :process.env.API_SECRET,
})






//  JSON and URL-encoded middleware first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ CORS middleware with credentials
app.use(cors({
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 3️⃣ Session middleware
app.use(session({
  secret: "KeyboardCat",
  resave: false,
  saveUninitialized: false, // better practice
  store: MongoStore.create({
    mongoUrl: "mongodb+srv://parasji014_db_user:parasji@cluster1.1dip1zl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
  }
}));

// 4️⃣ Routes
app.use("/user", UserRouter);
app.use("/admin", AdminRouter);
app.use("/product", ProductRouter);
app.post("/get-signature",async(req,res)=>{
    const timestamp=Math.floor((Date.now()/1000));
    const paramstosign={folder:"blinkin_uploads",timestamp}
    const stringtosign=Object.keys(paramstosign)
    .sort()
    .map(k=>`${k}=${paramstosign[k]}`)
    .join("&");
    const signature=crypto
    .createHash("sha1")
    .update(stringtosign+process.env.API_SECRET)
    .digest("hex");
    res.json({
            ...paramstosign,
            signature,
            cloudName:process.env.CLOUD_NAME,
            api_key:process.env.API_KEY,
    })
})


// 5️⃣ Connect MongoDB and start server
const PORT = process.env.Port || 5000;
mongoose.connect("mongodb+srv://parasji014_db_user:parasji@cluster1.1dip1zl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1")
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log(`MongoDB connection failed: ${err}`);
  });
