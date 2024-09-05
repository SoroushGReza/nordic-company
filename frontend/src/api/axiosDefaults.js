import axios from "axios";
import Cookies from "js-cookie";

axios.defaults.baseURL = "https://nordic-company-b4376fa6e38c.herokuapp.com/api/";
/*"https://8000-soroushgrez-tinyswebsit-hmdy1e3e5ct.ws-us115.gitpod.io/api";*/
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

const token = Cookies.get("access_token");

if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const axiosReq = axios.create();
export const axiosRes = axios.create();
