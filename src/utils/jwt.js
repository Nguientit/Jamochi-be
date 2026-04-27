// utils/jwt.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'jamochi_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const sign = (payload) => jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

const verify = (token) => {
  try {
    return { valid: true, payload: jwt.verify(token, SECRET) };
  } catch (err) {
    return { valid: false, payload: null, error: err.message };
  }
};

module.exports = { sign, verify };