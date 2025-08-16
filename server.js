const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
dotenv.config();

const authRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const industryRoutes = require("./routes/industryRoutes");
const profileRoutes = require("./routes/profileRoutes");





// Middleware — must be before routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use auth routes here
app.use("/api/auth", authRoutes);
//admin routes
app.use("/api/admin", adminRoutes);
// Industry and profile routes
app.use("/industries", industryRoutes);
// Profile routes
app.use("/profile", profileRoutes);
// Connect DB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 8080, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 8080}`)
    );
  })
  .catch((err) => console.error("❌ DB connection error:", err));
