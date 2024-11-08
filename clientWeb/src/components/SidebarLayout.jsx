import api from "../services/api";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  HiMiniSquares2X2,
  HiUser,
  HiCog,
  HiArrowLeftStartOnRectangle,
} from "react-icons/hi2";

export default function SidebarLayout() {
  // Function to handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      // ส่ง token ไปยัง API เพื่อบันทึกการ logout
      await api.post("/logout", { token });

      // ลบ token ออกจาก localStorage
      localStorage.removeItem("token");

      // เปลี่ยนเส้นทางไปยังหน้า login
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <div className="flex min-h-screen h-screen bg-gray-100">
        <div className="flex flex-col h-full p-4 bg-gray-900 text-white w-64 shadow-lg">
          <div className="mb-8 flex p-1 items-center">
            <img src="/src/assets/logo.png" alt="png" className="h-7 w-7" />
            <h2 className="text-2xl font-bold text-center text-indigo-500 ml-2">
              WATER
            </h2>
          </div>
          <nav className="flex flex-col space-y-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-300 ${
                  isActive ? "bg-gray-800" : "hover:bg-gray-800"
                } rounded-lg transition duration-300`
              }
            >
              <HiMiniSquares2X2 className="mr-3" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/personnel"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-300 ${
                  isActive ? "bg-gray-800" : "hover:bg-gray-800"
                } rounded-lg transition duration-300`
              }
            >
              <HiUser className="mr-3" />
              <span>Personnel</span>
            </NavLink>
            <NavLink
              to="/usability"
              className={({ isActive }) =>
                `flex items-center p-2 text-gray-300 ${
                  isActive ? "bg-gray-800" : "hover:bg-gray-800"
                } rounded-lg transition duration-300`
              }
            >
              <HiCog className="mr-3" />
              <span>Usability</span>
            </NavLink>
            <Link
              onClick={handleLogout}
              className="flex items-center p-2 text-gray-300 hover:bg-gray-800 rounded-lg transition duration-300"
            >
              <HiArrowLeftStartOnRectangle className="mr-3" />
              <span>Logout</span>
            </Link>
          </nav>
        </div>
        <main className="flex-grow p-6 h-full overflow-auto">
          <Outlet /> {/* แสดงเนื้อหาของแต่ละหน้า */}
        </main>
      </div>
    </>
  );
}
