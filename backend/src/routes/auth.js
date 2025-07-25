const express = require('express');
const passport = require('../config/passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Debug route to check Google OAuth config
router.get('/google/debug', (req, res) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    frontendUrl: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === 'production' 
      ? 'https://swapr.onrender.com/api/auth/google/callback'
      : 'http://localhost:5000/api/auth/google/callback')
  });
});

// Google OAuth
router.get('/google', (req, res, next) => {
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth credentials missing');
    return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=google_config_missing`);
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_auth_failed` 
  }), 
  (req, res) => {
    try {
      
      if (!req.user) {
        console.error('No user found in Google OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=no_user_found`);
      }
      
      // Generate JWT and set cookie
      const { signToken } = require('../utils/jwt');
      const token = signToken({ id: req.user._id });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
      
      // Redirect to frontend
      res.redirect(`${process.env.FRONTEND_URL}/`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=token_generation_failed`);
    }
  }
);

module.exports = router; 