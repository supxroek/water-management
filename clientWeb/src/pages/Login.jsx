import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Function to handle login
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/login", {
        username,
        password,
      });

      const token = response.data.token;
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      // Store token in sessionStorage and local storage
      sessionStorage.setItem("token", token);
      localStorage.setItem("token", token);

      // Navigate and show success toast based on role
      if (userRole === "admin") {
        navigate("/dashboard");
        toast.success("Login successful! Welcome to Admin.", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
        });
      } else {
        navigate("/user-page");
        toast.success("Login successful! Welcome.", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
        { position: "top-center", autoClose: 2000, theme: "light" }
      );
    }
  };

  useEffect(() => {
    const checkToken = () => {
      // ตรวจสอบว่ามี token ใน sessionStorage หรือไม่ ถ้ามีให้ลบออก เมื่อผ่านระยะเวลาที่กำหนด
      if (sessionStorage.getItem("token") || localStorage.getItem("token")) {
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
      }
    };

    checkToken();

    // Set interval for fetching data every 1 minute (60000ms)
    const intervalId = setInterval(checkToken, 50000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-500 hover:scale-105">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              src="/src/assets/logo.png"
              alt="Logo"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-6 mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
              Login
            </h2>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-gray-600">Email</label>
              <input
                type=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
