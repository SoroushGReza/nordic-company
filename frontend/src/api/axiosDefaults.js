import axios from "axios";

// Grundläggande inställningar för Axios
axios.defaults.baseURL = "https://nordic-company-b4376fa6e38c.herokuapp.com/api/";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

// Funktion för att hämta token från localStorage
const getToken = () => {
    const token = localStorage.getItem("access");
    if (token) {
        return `Bearer ${token}`;
    }
    return null;
};

// Sätt access-token om den finns
const setAuthHeader = () => {
    const token = getToken();
    if (token) {
        axios.defaults.headers.common["Authorization"] = token;
    }
};

// Skapa Axios-instans för förfrågningar
export const axiosReq = axios.create();
export const axiosRes = axios.create();

// Sätt token vid varje förfrågan
axiosReq.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers["Authorization"] = token; // Sätt header för varje request
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Hantera svar, speciellt 401-fel för att försöka uppdatera token
axiosReq.interceptors.response.use(
    (response) => {
        return response; // Returnera svar om allt går bra
    },
    async (error) => {
        const originalRequest = error.config;

        // Om 401 Unauthorized och vi har inte redan försökt uppdatera token
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem("refresh");

                // Skicka förfrågan om att uppdatera access-token
                const { data } = await axios.post("/accounts/token/refresh/", {
                    refresh: refreshToken,
                });

                localStorage.setItem("access", data.access); // Spara ny access-token
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

                // Upprepa den ursprungliga förfrågan
                return axiosReq(originalRequest);
            } catch (refreshError) {
                console.error("Misslyckades med att uppdatera token", refreshError);
                // Logga ut användaren om refresh-token misslyckas
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login"; // Skicka användaren till login
            }
        }

        return Promise.reject(error);
    }
);

setAuthHeader();
