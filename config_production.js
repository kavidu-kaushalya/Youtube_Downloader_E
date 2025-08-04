// Production config - update after Railway deployment
const CONFIG = {
  development: {
    serverUrl: 'http://127.0.0.1:5000'
  },
  production: {
    serverUrl: 'https://YOUR_RAILWAY_URL_HERE'  // Replace with actual Railway URL
  }
};

// Change this to 'production' after Railway deployment
const ENVIRONMENT = 'production';  // <-- Change this line
const SERVER_CONFIG = CONFIG[ENVIRONMENT];

console.log(`🔧 Environment: ${ENVIRONMENT}`);
console.log(`🌐 Server URL: ${SERVER_CONFIG.serverUrl}`);
