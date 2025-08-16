require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const User = require("./models/User");
const Industry = require("./models/Industry");
const ClimateScore = require("./models/ClimateScore");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ClimatecreditDb";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

async function seed() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Industry.deleteMany({});
    await ClimateScore.deleteMany({});
    console.log("All previous data deleted");

    // Arrays to keep references
    const allUsers = [];
    const allIndustries = [];

    // Create 20 owner users + industries
    for (let i = 0; i < 20; i++) {
      // Create owner user
      const ownerUser = new User({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: await bcrypt.hash("123456", 10),
        isVerified: true,
        role: "owner",
      });
      await ownerUser.save();

      // Create industry
      const industry = new Industry({
        name: faker.company.name(),
        sector: faker.commerce.department(),
        climateScore: faker.number.int({ min: 50, max: 100 }),
        owner: ownerUser._id, // required field
      });
      await industry.save();

      // Link industry to user
      ownerUser.industry = industry._id;
      await ownerUser.save();

      allUsers.push(ownerUser);
      allIndustries.push(industry);
    }

    // Create 80 normal users linked randomly to existing industries or no industry
    for (let i = 0; i < 80; i++) {
      const randomIndustry =
        Math.random() > 0.5
          ? allIndustries[Math.floor(Math.random() * allIndustries.length)]
          : null;

      const normalUser = new User({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: await bcrypt.hash("123456", 10),
        isVerified: true,
        role: "user",
        industry: randomIndustry ? randomIndustry._id : null,
      });

      await normalUser.save();
      allUsers.push(normalUser);
    }

    // Create ClimateScore entries for each industry
    for (let ind of allIndustries) {
      const score = new ClimateScore({
        industry: ind._id,
        score: ind.climateScore,
        rating:
          ind.climateScore >= 90
            ? "Excellent"
            : ind.climateScore >= 75
            ? "Good"
            : ind.climateScore >= 50
            ? "Average"
            : ind.climateScore >= 25
            ? "Poor"
            : "Critical",
      });
      await score.save();
    }

    console.log("Seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
