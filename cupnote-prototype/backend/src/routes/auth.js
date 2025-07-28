const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const db = require('../db');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().min(3).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate tokens
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

// Register endpoint
router.post('/register', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }

    const { email, password, username } = value;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'User with this email already exists'
        }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const userId = uuidv4();
    const newUser = await db.query(
      `INSERT INTO users (id, email, password_hash, username)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, created_at`,
      [userId, email, passwordHash, username]
    );

    const user = newUser.rows[0];
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_in: 3600 * 24 * 7 // 7 days in seconds
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }

    const { email, password } = value;

    // Get user
    const result = await db.query(
      'SELECT id, email, username, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials'
        }
      });
    }

    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_in: 3600 * 24 * 7 // 7 days in seconds
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required'
        }
      });
    }

    jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid refresh token'
          }
        });
      }

      // Get fresh user data
      const result = await db.query(
        'SELECT id, email, username FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found'
          }
        });
      }

      const user = result.rows[0];
      const tokens = generateTokens(user);

      res.json({
        success: true,
        data: {
          token: {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expires_in: 3600 * 24 * 7
          }
        }
      });
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;