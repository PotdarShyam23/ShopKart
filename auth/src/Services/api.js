import axios from "axios";
// it send the request from fronted to backend like request -> axios -> cors -> backened

// so like cors will check or allow cross origin like that browser can accept from that request

// xios send the url to backend

let apiBaseURL = "http://localhost:5000";
if (import.meta.env.PROD) {
  apiBaseURL = "/api";
}
if (import.meta.env.VITE_API_URL) {
  apiBaseURL = import.meta.env.VITE_API_URL;
}

const api = axios.create({
  baseURL: apiBaseURL,
  // it send cookie to the browser
  withCredentials: true,
});

export default api;
