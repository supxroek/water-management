import axios from "axios";

const apiUser = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

export default apiUser;
