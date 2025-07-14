const Url = require('./models/Url');
const { Log } = require('./models/Url');
const { generateShortcode, isValidUrl } = require('./utils/helper');

// Create short URL
const createShortUrl = async (req, res) => {
  try {
    const { url, validity = 30, shortcode } = req.body;

    // Validate URL
    if (!isValidUrl(url)) {
      Log("backend", "error", "controller", "Invalid URL format");
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Generate shortcode if not provided
    const finalShortcode = shortcode || generateShortcode();
    
    // Save to database
    const newUrl = await Url.create({
      originalUrl: url,
      shortcode: finalShortcode,
      expiry: new Date(Date.now() + validity * 60000),
    });

    Log("backend", "info", "controller", `Short URL created: ${finalShortcode}`);
    
    res.status(201).json({
      shortLink: `http://${req.headers.host}/${finalShortcode}`,
      expiry: newUrl.expiry.toISOString(),
    });
  } catch (error) {
    Log("backend", "error", "controller", `Short URL creation failed: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Redirect to original URL
const redirectToUrl = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const url = await Url.findOne({ shortcode });

    if (!url) {
      Log("backend", "error", "controller", `Shortcode not found: ${shortcode}`);
      return res.status(404).json({ error: "URL not found" });
    }

    // Log click
    url.clicks.push({ ip: req.ip, referrer: req.get('Referer') });
    await url.save();

    Log("backend", "info", "controller", `Redirecting: ${shortcode} -> ${url.originalUrl}`);
    res.redirect(url.originalUrl);
  } catch (error) {
    Log("backend", "error", "controller", `Redirect failed: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get URL stats
const getUrlStats = async (req, res) => {
  try {
    const { shortcode } = req.params;
    const url = await Url.findOne({ shortcode });

    if (!url) {
      Log("backend", "error", "controller", `Stats request failed: ${shortcode} not found`);
      return res.status(404).json({ error: "URL not found" });
    }

    Log("backend", "info", "controller", `Stats retrieved for: ${shortcode}`);
    res.status(200).json({
      originalUrl: url.originalUrl,
      shortcode: url.shortcode,
      expiry: url.expiry,
      totalClicks: url.clicks.length,
      clicks: url.clicks,
    });
  } catch (error) {
    Log("backend", "error", "controller", `Stats retrieval failed: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createShortUrl, redirectToUrl, getUrlStats };