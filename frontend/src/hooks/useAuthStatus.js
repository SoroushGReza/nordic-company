import { useState, useEffect } from "react";
import { axiosReq } from "../api/axiosDefaults";

// Handle auth and adminstatus
const useAuthStatus = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (token) {
            setIsAuthenticated(true);
            const checkAdminStatus = async () => {
                try {
                    const { data: user } = await axiosReq.get("/accounts/profile/");
                    setIsAdmin(user.is_staff || user.is_superuser);
                } catch (err) {
                    console.error("Error fetching user status:", err);
                    setIsAdmin(false);
                }
            };
            checkAdminStatus();
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    return { isAdmin, isAuthenticated };
};

export default useAuthStatus;
