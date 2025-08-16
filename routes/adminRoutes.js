// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

const Industry =require("../models/Industry");
const EmissionRecord=require("../models/EmissionRecord")
const User = require("../models/User");



//Read route-To read all industries
router.get("/industries", protect, adminOnly, async (req, res) => {
  try {
    const industries = await Industry.find();
    res.status(200).json(industries);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching industries", error: error.message });
  }
});



// POST create new industry


router.post("/industries", protect, adminOnly, async (req, res) => {
  try {
    const { name, sector, emissions } = req.body;
    const newIndustry = new Industry({ name, sector, emissions });
    await newIndustry.save();
    res.status(201).json({ message: "Industry added successfully", industry: newIndustry });
  } catch (error) {
    res.status(500).json({ message: "Error adding industry", error: error.message });
  }
});


//Update an industry

router.put("/industries/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, sector, emissions } = req.body;
    const updatedIndustry = await Industry.findByIdAndUpdate(
      req.params.id,
      { name, sector, emissions },
      { new: true, runValidators: true }
    );

    if (!updatedIndustry) {
      return res.status(404).json({ message: "Industry not found" });
    }

    res.status(200).json({
      message: "Industry updated successfully",
      industry: updatedIndustry,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating industry", error: error.message });
  }
});

//delete an industry
router.delete("/industries/:id", async (req, res) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) {
      return res.status(404).json({ message: "Industry not found" });
    }
    res.json({ message: "Industry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




//Users management

// Get all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Hide password
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Get single user by ID
router.get("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

// Delete user
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});



module.exports = router;
