import { useState } from "react";
import { Button, TextField, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiUser from "../services/apiUser";

export default function Login() {
  const [idCardNumber, setIdCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await apiUser.post("/login", {
        idCardNumber,
        password,
      });
      if (response.data.role === "admin") {
        navigate("/dashboard");
      } else {
        alert("Unauthorized");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <div className="login">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
        >
          <TextField
            label="Username"
            variant="outlined"
            value={idCardNumber}
            onChange={(e) => setIdCardNumber(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </Box>
      </div>
    </>
  );
}
