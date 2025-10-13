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

// ===== CORS must come BEFORE session =====
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
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
    store: MongoStore.create({
      mongoUrl: "mongodb+srv://parasji014_db_user:parasji@cluster1.1dip1zl.mongodb.net/?retryWrites=true&w=majority"
    }),
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      secure: inProduction, // Use secure cookies in production
      sameSite: inProduction ? "none" : "lax", // 'none' for cross-domain, 'lax' for same-domain
    }
  })
);

// Required for behind proxy (Render)
if (inProduction) {
  app.set("trust proxy", 1); // trust first proxy
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

mongoose.connect("mongodb+srv://parasji014_db_user:parasji@cluster1.1dip1zl.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));
