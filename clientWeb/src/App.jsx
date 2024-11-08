import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import PrivateRoute from "./services/PrivateRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Personnel from "./pages/Personnel";
import Usability from "./pages/Usability";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* ส่วน SidebarLayout */}
        <Route element={<SidebarLayout />}>
          {/* ใช้ PrivateRoute ในการป้องกันหน้า admin */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="admin">
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* ใช้ PrivateRoute ในการป้องกันหน้า admin */}
          <Route
            path="/personnel"
            element={
              <PrivateRoute role="admin">
                <Personnel />
              </PrivateRoute>
            }
          />

          {/* ใช้ PrivateRoute ในการป้องกันหน้า admin */}
          <Route
            path="/usability"
            element={
              <PrivateRoute role="admin">
                <Usability />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
