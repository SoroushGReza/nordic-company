import { useEffect } from 'react';
import { axiosReq } from "../api/axiosDefaults";
import { useNavigate } from "react-router-dom";

const useAdminCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: user } = await axiosReq.get("/accounts/profile/");

        // Redirect if user is not admin
        if (!user.is_staff && !user.is_superuser) {
          navigate("/bookings");
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
        navigate("/login");
      }
    };

    checkAdminStatus();
  }, [navigate]);
};

export default useAdminCheck;
