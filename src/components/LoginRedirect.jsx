import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const LoginRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // If user is already logged in, redirect to home
      navigate("/home");
    }
  }, [user, navigate]);

  // If not authenticated, continue to login
  if (user) {
    // Avoid rendering anything while redirecting
    return null;
  }

  return null;
};

export default LoginRedirect;
