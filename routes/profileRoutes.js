const express = require("express");
const router = express.Router();
const {
  getProfile,
  changePassword
} = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getProfile); // GET /profile
router.put("/change-password", protect, changePassword); // PUT /profile/change-password

module.exports = router;
