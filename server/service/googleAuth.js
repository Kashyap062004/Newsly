const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const {User} = require("../models/user");
require("dotenv").config(); // Make sure this line is near the top
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// Ensure environment variables are loaded
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("❌ Google OAuth environment variables are not set!");
  process.exit(1); // Exit if secrets are missing
}



passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        let isNew = false;

        if (!user) {
          const randomPassword = crypto.randomBytes(4).toString("hex"); // 8-character hex string

          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: randomPassword,
            subscribe: false,
            requestsToday: 0,
            lastRequestDate: new Date(),
          });

          // Send welcome email with generated password
          await sendWelcomeEmail(user.email, user.name, randomPassword);

          isNew = true;
        }

        user._isNewGoogleUser = isNew;
        return done(null, user);
      } catch (err) {
        console.error("Error in Google Strategy:", err);
        return done(err, null);
        
      }
    }
  )
);

// Define mailer
async function sendWelcomeEmail(email, name, password) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kashyap.trivedi2004@gmail.com",
      pass: "qpoa vkzo mrnn sqzo", // Use App Passwords if 2FA is enabled
    },
  });

  const mailOptions = {
    from: "kashyap.trivedi2004@gmail.com",
    to: email,
    subject: "Welcome to Newsly - Your Account Details",
    text: `Dear ${name},

      Thank you for registering with Newsly using your Google account.

      Your account has been created successfully. For your reference, here is your temporary password: ${password}

      You can use this password to log in using email in the future. We recommend updating your password from Profile section after logging in.

      If you did not register on Newsly, please contact our support team immediately.

      Best regards,  
      Newsly Team`,
  };

  await transporter.sendMail(mailOptions);
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
