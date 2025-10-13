// backend/index.js
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
  api_secret: process.env.API_SECRET,
});

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// ===== CORS =====
app.use(cors({
  origin: "http://localhost:5173",  // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,               // important for cookies
}));

// ===== Session =====
app.set("trust proxy", 1); // trust first proxy (needed on Render)

app.use(session({
  secret: process.env.SESSION_SECRET || "KeyboardCat",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || "mongodb+srv://parasji014_db_user:parasji@cluster1.1dip1zl.mongodb.net/?retryWrites=true&w=majority",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
    secure: false,          // must be false for localhost HTTP
    sameSite: "lax",        // allows cookies from localhost frontend
  },
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

mongoose.connect(process.env.MONGO_URI || "mongodb+srv://parasji014_db_user:parasji@cluster1.1dip1zl.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));
