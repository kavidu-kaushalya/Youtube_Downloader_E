// Debug version - logs everything
console.log("🔧 CONFIG DEBUG VERSION");

const CONFIG = {
  development: {
    serverUrl: 'http://127.0.0.1:5000'
  },
  localNetwork: {
    serverUrl: 'http://192.168.1.8:5000'
  }
};

// Force development for debugging
const ENVIRONMENT = 'development';
const SERVER_CONFIG = CONFIG[ENVIRONMENT];

console.log(`🔧 Environment: ${ENVIRONMENT}`);
console.log(`🌐 Server URL: ${SERVER_CONFIG.serverUrl}`);
console.log(`🌍 Current page: ${window.location.href}`);

// Test server connectivity
fetch(SERVER_CONFIG.serverUrl)
  .then(response => {
    console.log("✅ Server connection test successful");
    console.log("Response status:", response.status);
  })
  .catch(error => {
    console.error("❌ Server connection test failed:", error);
  });
