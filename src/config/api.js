// config/api.js
// Default API URL for development
let API_BASE_URL = "http://0.0.0.0:3000";

// Check if a runtime config exists (injected by Docker container at startup)
if (
  typeof window !== "undefined" &&
  window._env_ &&
  window._env_.REACT_APP_API_URL
) {
  API_BASE_URL = window._env_.REACT_APP_API_URL;
}

export { API_BASE_URL };
