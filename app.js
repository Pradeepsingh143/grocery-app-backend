import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import CustomError from "./utils/customError.js";
// import testRoutes from "./routes/testRoutes.js";
import corsOptions from "./config/corsOptions.js";
import credentials from "./middlewares/credentials.js";

// routes
import userRoutes from "./routes/userRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cloudinaryImagesRoutes from "./routes/cloudinaryImagesRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";

const __dirname = path.resolve();

const app = express();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// morgan logger
app.use(morgan("tiny"));

//serve static files

app.use("/", express.static(path.join(__dirname, "/public")));

// home route
app.get("/", (_req, res) => {
  res.status(201).send("Hello, welcome to ecomm backend");
});

// use user routes
app.use("/api/auth", userRoutes);
// collection routes
app.use("/api/collection", collectionRoutes);
// coupon routes
app.use("/api/coupon", couponRoutes);
// product routes
app.use("/api/product", productRoutes);
// cloudinary routes from images
app.use("/cloudinary", cloudinaryImagesRoutes);
// user profile routes
app.use("/api/profile", userProfileRoutes);
// cart routes
app.use("/api/cart", cartRoutes);
// wishlist routes
app.use("/api/wishlist", wishlistRoutes);
// order routes
app.use("/api/order", orderRoutes);
// contact routes
app.use("/api/contact", contactRoutes);
// review routes
app.use("/api/review", reviewRoutes);
// review routes
app.use("/api/deal", dealRoutes);

// unknown routes or 404
app.use((req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//handle custom error
app.use((err, _req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.code || 400).json({
      ok: false,
      message: err.message,
      code: err.code,
    });
  } else if (err.name === "ValidationError") {
    res.status(err.code || 400).json({
      ok: false,
      message: err.message,
      code: err.status,
    });
  } else {
    next(err);
  }
});

// testing route
// app.use("/api/test/", testRoutes);

export default app;
