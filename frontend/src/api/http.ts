import axios from "axios";

const url = "http://127.0.0.1:8000"
const http = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
