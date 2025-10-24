// server.cjs
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const cors = require("cors");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const helmet = require("helmet");
const passport=require("passport")

const UserRouter = require("./routes/UserRoute.js");
const AdminRouter = require("./routes/AdminRoute.js");
const ProductRouter = require("./routes/Products.js");

dotenv.config();
const app = express();

// ===== Cloudinary Configuration =====
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// ===== CORS must come BEFORE session =====
app.use(
  cors({
    origin: ["http://localhost:5173","https://blinkin.vercel.app"], // Your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

// ===== Session Config =====
const inProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "KeyboardCat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // must be true for HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}


// ===== Routes =====
app.use("/user", UserRouter);
app.use("/admin", AdminRouter);
app.use("/product", ProductRouter);

// ===== Signature route =====
app.post("/get-signature", async (req, res) => {
  const timestamp = Math.floor((Date.now() / 1000));
  const paramstosign = { folder: "blinkin_uploads", timestamp }
  const stringtosign = Object.keys(paramstosign)
    .sort()
    .map(k => `${k}=${paramstosign[k]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(stringtosign + process.env.CLOUD_API_SECRET)
    .digest("hex");
  res.json({
    ...paramstosign,
    signature,
    cloudName: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
  })
})


// ===== MongoDB & Server Start =====
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));
