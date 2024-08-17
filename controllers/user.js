const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const otpGenerator = require("otp-generator");
const twilio = require("twilio");
const User = require("../models/user"); // Adjust the path as necessary
require("dotenv").config();

const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new twilio(twilioSid, twilioToken);

// Function to send OTP to mobile using Twilio
async function sendOTPToMobile(mobile, otp) {
  try {
    await twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: twilioNumber,
      to: mobile,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

// CREATE
router.post(
  "/sendOTP",
  [
    body("salutation")
      .isIn(["Mr", "Ms", "Mrs", "Dr", "Prof"])
      .withMessage("Invalid Mr/Ms"),
    body("firstName")
      .isLength({ min: 2, max: 50 })
      .trim()
      .withMessage("Name between 2 & 50 char"),
    body("isdCode")
      .matches(/^\+\d{1,3}$/)
      .withMessage("Invalid ISD"),
    body("mobile")
      .matches(/^\+\d{1,3}\d{10}$/)
      .withMessage("Invalid Mobile <10-digit>"),
    body("email").isEmail().withMessage("Invalid Email"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobile, salutation, firstName, isdCode, email } = req.body;

    try {
      // Generate OTP using otp-generator
      const otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      // Upsert the user details along with the generated OTP
      const user = await User.findOneAndUpdate(
        { mobile }, // Find the user by mobile number
        {
          salutation,
          firstName,
          isdCode,
          email,
          otp,
          otpExpire: new Date(Date.now() + 60000), // Set OTP expiration time (1 minute from now)
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Send OTP via Twilio
      await sendOTPToMobile(mobile, otp);

      res.status(200).json({ message: "OTP sent successfully", user });
    } catch (error) {
      console.error("Error occurred:", error); // Log the error for debugging
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/verifyOTP", async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user has exceeded the OTP request limit
    if (user.otpRequests >= 3) {
      return res.status(429).json({ error: "OTP request limit exceeded" });
    }

    // Check if the OTP is invalid
    if (user.otp !== otp) {
      user.invalidOtpAttempts = (user.invalidOtpAttempts || 0) + 1;

      if (user.invalidOtpAttempts >= 3) {
        await user.save();
        return res
          .status(429)
          .json({ error: "OTP invalid attempts limit exceeded" });
      }

      await user.save();
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if the OTP has expired
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // OTP is valid and not expired
    res.status(200).json({ message: "OTP verified successfully" });

    // Reset OTP request count and invalid attempts after successful verification
    user.otpRequests = 0;
    user.invalidOtpAttempts = 0;
    await user.save();
  } catch (error) {
    console.error("Error occurred:", error); // Log the error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
