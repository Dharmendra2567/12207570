const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortcode: { type: String, required: true, unique: true },
  expiry: { type: Date, required: true },
  clicks: [{
    timestamp: { type: Date, default: Date.now },
    referrer: String,
    ip: String,
  }],
});

module.exports = mongoose.model('Url', urlSchema);