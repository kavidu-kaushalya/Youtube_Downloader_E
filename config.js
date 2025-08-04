// Configuration for different environments
const CONFIG = {
  // Development (local server)
  development: {
    serverUrl: 'http://127.0.0.1:5000'
  },
  
  // Local network (other devices on same WiFi)
  localNetwork: {
    serverUrl: 'http://192.168.1.8:5000'  // Your actual local IP
  },
  
  // Railway deployment (production)
  production: {
    serverUrl: 'https://your-railway-app-name.railway.app'  // Replace with your Railway URL
  },
  
  // Replit deployment (backup)
  replit: {
    serverUrl: 'https://youtubedownloadere.kavindukaushal3.repl.co'
  }
};

// Smart environment detection
function detectEnvironment() {
  console.log(`🔍 Current hostname: ${window.location.hostname}`);
  
  // For production deployment (change this to 'production' after Railway deploy)
  return 'development';  // Change to 'production' when using Railway
  
  // Automatic detection (uncomment when ready):
  /*
  // Check if accessing from localhost/127.0.0.1
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'development';
  }
  
  // For other devices on same network, use localNetwork config
  return 'production';  // Use production for internet access
  */
}

const ENVIRONMENT = detectEnvironment();

// Export the current configuration
const SERVER_CONFIG = CONFIG[ENVIRONMENT];

console.log(`🔧 Environment: ${ENVIRONMENT}`);
console.log(`🌐 Server URL: ${SERVER_CONFIG.serverUrl}`);
