import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect directly to create page (no auth for now)
    navigate("/create");
  }, [navigate]);

  return null; // Redirecting...
};

export default Auth;
