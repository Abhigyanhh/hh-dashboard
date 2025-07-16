import axios from "axios";

const url = "https://hh-dashboard-zwpc.onrender.com"
const http = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
