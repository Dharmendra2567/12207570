const axios = require('axios');

const Log = (stack, level, package, message) => {
  const logData = { stack, level, package, message };
  
  axios.post(process.env.LOG_API_URL, logData, {
    headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` },
  }).catch((err) => {
    console.error("Log API failed:", err.message);
  });
};

module.exports = { Log };