// backend/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists
          let user = await User.findOne({ email: profile.emails[0].value })

          if (user) {
            // User exists, return user
            return done(null, user)
          } else {
            // Create new user
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: 'google-oauth-' + profile.id, // Not used for Google auth
              profileData: {}
            })

            await user.save()
            return done(null, user)
          }
        } catch (error) {
          console.error('Google OAuth error:', error)
          return done(error, null)
        }
      }
    )
  )
}
