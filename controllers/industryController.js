const Industry = require("../models/Industry");
const User = require("../models/User");

const EmissionRecord = require("../models/EmissionRecord");

// Get all industries (with search & sort)
exports.getAllIndustries = async (req, res) => {
  try {
    const { search, sort } = req.query;

    let query = {};
    if (search && search.trim() !== "") {
      query = { name: { $regex: search, $options: "i" } };
    }

    let industries = await Industry.find(query);

    if (sort === "score") {
      industries = industries.sort((a, b) => b.climateScore - a.climateScore);
    } else if (sort === "name") {
      industries = industries.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "lastUpdated") {
      industries = industries.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    }

    res.json(industries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching industries" });
  }
};

// Get leaderboard (top 10)
exports.getLeaderboard = async (req, res) => {
  try {
    const topIndustries = await Industry.find()
      .sort({ climateScore: -1 })
      .limit(10);
    res.json(topIndustries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};

// GET /industries/global-score
exports.getGlobalOverview = async (req, res) => {
  try {
    const industries = await Industry.find();

    if (industries.length === 0) {
      return res.json({
        averageScore: 0,
        totalIndustries: 0,
        highest: null,
        lowest: null,
      });
    }

    // Calculate average score
    const totalScore = industries.reduce(
      (sum, ind) => sum + ind.climateScore,
      0
    );
    const averageScore = totalScore / industries.length;

    // Find highest and lowest
    const highest = industries.reduce((prev, curr) =>
      curr.climateScore > prev.climateScore ? curr : prev
    );
    const lowest = industries.reduce((prev, curr) =>
      curr.climateScore < prev.climateScore ? curr : prev
    );

    res.json({
      averageScore: averageScore.toFixed(2),
      totalIndustries: industries.length,
      highest: {
        industryName: highest.name,
        sector: highest.sector,
        score: highest.climateScore,
      },
      lowest: {
        industryName: lowest.name,
        sector: lowest.sector,
        score: lowest.climateScore,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching global overview" });
  }
};


// Normal user creates a new Industry and becomes owner
exports.createIndustry = async (req, res) => {
    try {
      const { name, sector } = req.body;
  
      if (!name || !sector) {
        return res.status(400).json({ message: "Industry name and sector are required" });
      }
  
      // 1. Create new Industry
      const newIndustry = new Industry({
        name,
        sector,
        score: 100, // default score
      });
      await newIndustry.save();
  
      // 2. Assign this industry to the user (make them owner)
      const user = await User.findById(req.user.id);
      user.industryId = newIndustry._id;
      user.role = "owner"; // <-- you should add role field in User schema
      await user.save();
  
      res.status(201).json({
        message: "Industry created successfully. You are now the owner.",
        industry: newIndustry,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating industry" });
    }
  };


 // GET /industries/dashboard
exports.getDashboard = async (req, res) => {
    try {
      // 1️⃣ Global Overview
      const industries = await Industry.find();
  
      let averageScore = 0;
      let highest = null;
      let lowest = null;
  
      if (industries.length > 0) {
        const totalScore = industries.reduce((sum, ind) => sum + (ind.climateScore || 0), 0);
        averageScore = totalScore / industries.length;
  
        highest = industries.reduce((prev, curr) =>
          curr.climateScore > prev.climateScore ? curr : prev
        );
        lowest = industries.reduce((prev, curr) =>
          curr.climateScore < prev.climateScore ? curr : prev
        );
      }
  
      const globalOverview = {
        totalIndustries: industries.length,
        averageScore: averageScore.toFixed(2),
        highest: highest
          ? { industryName: highest.name, sector: highest.sector, score: highest.climateScore }
          : null,
        lowest: lowest
          ? { industryName: lowest.name, sector: lowest.sector, score: lowest.climateScore }
          : null,
      };
  
      // 2️⃣ Leaderboard (Top 3)
      const leaderboard = await Industry.find().sort({ climateScore: -1 }).limit(3);
  
      // 3️⃣ User industry info (if owner)
      const user = await User.findById(req.user.id).populate("industry", "name sector climateScore");
      const userIndustry = user.industryId
        ? {
            name: user.industryId.name,
            sector: user.industryId.sector,
            climateScore: user.industryId.climateScore,
          }
        : null;
  
      // 4️⃣ Emissions for user's industry (if owner)
      let emissions = [];
      if (user.industryId) {
        emissions = await EmissionRecord.find({ industryId: user.industryId._id }).sort({ date: -1 });
      }
  
      // 5️⃣ Send combined response
      res.json({
        globalOverview,
        leaderboard,
        userIndustry,
        emissions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  };
  //when user becomes owner
  // GET /industries/my-industry
  exports.getMyIndustry = async (req, res) => {
    try {
      if (req.user.role !== "owner") {
        return res
          .status(403)
          .json({ message: "Access denied. Not an owner." });
      }

      const industry = await Industry.findById(req.user.industry).populate(
        "owner",
        "username email"
      );
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }

      res.json(industry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching your industry" });
    }
  };
// PUT /industries/my-industry
exports.updateMyIndustry = async (req, res) => {
    try {
      if (req.user.role !== "owner") {
        return res.status(403).json({ message: "Access denied. Not an owner." });
      }
  
      const { name, sector } = req.body;
  
      const industry = await Industry.findById(req.user.industry);
      if (!industry) {
        return res.status(404).json({ message: "Industry not found" });
      }
  
      if (name) industry.name = name;
      if (sector) industry.sector = sector;
  
      await industry.save();
  
      res.json({ message: "Industry updated successfully", industry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating industry" });
    }
  };
  

// POST /industries/my-industry/emission
exports.addEmission = async (req, res) => {
    try {
      if (req.user.role !== "owner") {
        return res.status(403).json({ message: "Access denied. Not an owner." });
      }
  
      const { co2, so2, nox, other, energyConsumption } = req.body;
      const reportImages = req.files ? req.files.map((f) => f.path) : [];
  
      // Save emission record
      const emission = new EmissionRecord({
        industryId: req.user.industry,
        emissions: { co2, so2, nox, other },
        energyConsumption,
        reportImages,
      });
      await emission.save();
  
      // Calculate updated climateScore
      const allEmissions = await EmissionRecord.find({
        industryId: req.user.industry,
      });
  
      const totalEmissions = allEmissions.reduce(
        (sum, e) =>
          sum +
          e.emissions.co2 +
          e.emissions.so2 +
          e.emissions.nox +
          e.emissions.other,
        0
      );
  
      const score = Math.max(0, 100 - totalEmissions / 1000);
  
      await Industry.findByIdAndUpdate(req.user.industry, { climateScore: score });
  
      res.status(201).json({
        message: "Emission added and score updated",
        emission,
        climateScore: score,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding emission" });
    }
  };
  

  // GET /industries/my-industry/emissions
exports.getEmissions = async (req, res) => {
    try {
      if (req.user.role !== "owner") {
        return res.status(403).json({ message: "Access denied. Not an owner." });
      }
  
      const emissions = await EmissionRecord.find({ industry: req.user.industry }).sort({ date: -1 });
  
      res.json({ emissions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching emissions" });
    }
  };
  