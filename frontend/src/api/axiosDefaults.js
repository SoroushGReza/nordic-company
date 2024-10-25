import axios from "axios";

// Dynamically set the base URL based on the environment
axios.defaults.baseURL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8000/api/"
        : "https://nordic-company-b4376fa6e38c.herokuapp.com/api/";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

// Function to get token from localStorage
const getToken = () => {
    const token = localStorage.getItem("access");
    if (token) {
        return `Bearer ${token}`;
    }
    return null;
};

// Set access-token if it exists
const setAuthHeader = () => {
    const token = getToken();
    if (token) {
        axios.defaults.headers.common["Authorization"] = token;
    }
};

// Create Axios instance for requests
export const axiosReq = axios.create();
export const axiosRes = axios.create();

// Set token for each request
axiosReq.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers["Authorization"] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle responses, especially 401 errors for token refresh
axiosReq.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refresh");
                const { data } = await axios.post("/accounts/token/refresh/", {
                    refresh: refreshToken,
                });

                localStorage.setItem("access", data.access);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

                return axiosReq(originalRequest);
            } catch (refreshError) {
                console.error("Failed to refresh token", refreshError);
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

setAuthHeader();
