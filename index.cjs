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

// ===== CORS =====
const FRONTEND_URL = process.env.NODE_ENV === "production" 
  ? "https://your-frontend-domain.com"  // change to deployed frontend URL
  : "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,  // required to send cookies
}));

// ===== Session =====
app.set("trust proxy", 1); // trust first proxy (needed on Render)

app.use(session({
  secret: process.env.SESSION_SECRET || "KeyboardCat",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true on Render (HTTPS)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  }
}));

// ===== Routes =====
app.use("/user", UserRouter);
app.use("/admin", AdminRouter);
app.use("/product", ProductRouter);

// ===== Cloudinary signature route =====
app.post("/get-signature", async (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = { folder: "blinkin_uploads", timestamp };
  const stringToSign = Object.keys(paramsToSign)
    .sort()
    .map(k => `${k}=${paramsToSign[k]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(stringToSign + process.env.CLOUD_API_SECRET)
    .digest("hex");

  res.json({
    ...paramsToSign,
    signature,
    cloudName: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
  });
});

// ===== MongoDB connection & server start =====
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));
