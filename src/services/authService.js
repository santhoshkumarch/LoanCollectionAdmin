// services/authService.js
import { API_BASE_URL } from "../config/api";

export const login = async credentials => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users?username=${credentials.username}&password=${credentials.password}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();

    if (users && users.length > 0) {
      const user = users[0];

      // Only allow login for Admin or Manager roles
      if (user.role !== "Admin" && user.role !== "Manager") {
        return {
          message: "Access denied. Only Admin or Manager can log in.",
          success: false,
        };
      }

      // Return successful login response
      return {
        message: "Login successful",
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role, // Include role in user object
        },
      };
    } else {
      // Return failure response
      return {
        message: "Invalid username or password",
        success: false,
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "Network error. Please try again.",
      success: false,
    };
  }
};
