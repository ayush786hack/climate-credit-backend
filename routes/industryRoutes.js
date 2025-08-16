const express = require("express");
const router = express.Router();
const {
  getAllIndustries,
  getLeaderboard,
  getGlobalOverview,
  createIndustry,getDashboard,getMyIndustry,updateMyIndustry,addEmission,getEmissions
} = require("../controllers/industryController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllIndustries); // GET /industries
router.get("/top", protect, getLeaderboard); // GET /industries/top
router.get("/global-score", protect, getGlobalOverview);//get global overview

router.post("/create", protect, createIndustry); // POST /industries/create 

router.get("/dashboard", protect, getDashboard); // GET /industries/dashboard


router.get("/my-industry", protect, getMyIndustry);      // GET /industries/my-industry
router.put("/my-industry", protect, updateMyIndustry);   // PUT /industries/my-industry
router.post("/my-industry/emission", protect, addEmission); // POST /industries/my-industry/emission
router.get("/my-industry/emissions", protect, getEmissions); // GET all emissions for owner

module.exports = router;
