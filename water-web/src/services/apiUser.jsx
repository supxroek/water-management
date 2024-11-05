import axios from "axios";

const apiUser = axios.create({
  baseURL: "http://localhost:5000/api/users",
});

export default apiUser;
