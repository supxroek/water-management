import { useEffect, useState } from "react";
import api from "../services/api";
import { CircularProgress } from "@mui/material";
import { Line } from "react-chartjs-2"; // นำเข้า Line chart
import "tailwindcss/tailwind.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ลงทะเบียนการใช้งาน chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [userLogs, setUserLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // กำหนดข้อมูลสำหรับกราฟ
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "จำนวนผู้ใช้",
        data: [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const [userCountResponse, userLogsResponse] = await Promise.all([
          api.get("/getUserCount", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/getUserlogs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // แปลงข้อมูลให้ตรงกับโครงสร้าง JSON ที่ได้รับ
        const formattedLogs = userLogsResponse.data.map((log) => ({
          id: log.log_id,
          userId: log.userlog_id,
          username: log.username,
          action: log.action,
          date: new Date(log.action_time),
          role: log.role,
        }));

        // จัดเรียงข้อมูลจากวันที่ล่าสุดไปหาก่อน
        formattedLogs.sort((a, b) => b.date - a.date);

        // กำหนดข้อมูลใหม่ให้กับ chartData
        const userCount = parseInt(userCountResponse.data.count, 10); // แปลงค่าเป็นตัวเลข
        setChartData({
          labels: ["วันนี้"], // คุณสามารถปรับช่วงเวลาเป็นวันที่ต่าง ๆ ได้
          datasets: [
            {
              label: "จำนวนผู้ใช้",
              data: [userCount], // จำนวนผู้ใช้ที่ดึงมาแสดงในกราฟ
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.1,
            },
          ],
        });

        setTotalUsers(userCount);
        setUserLogs(formattedLogs);

        console.log("User logs:", formattedLogs);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set interval for fetching data every 1 minute (60000ms)
    const intervalId = setInterval(fetchData, 600000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <div className="flex-grow p-4">
        <h1 className="text-3xl font-semibold text-gray-800">Manage Users</h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome to the manage users page! You are an admin.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* รายละเอียดผู้ใช้งาน */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700">จำนวนผู้ใช้</h2>
          <p className="text-4xl font-bold text-indigo-600">{totalUsers}</p>

          {/* กราฟแสดงจำนวนผู้ใช้ */}
          <div className="mt-4">
            <Line data={chartData} />
          </div>
        </div>

        {/* รายละเอียดการใช้น้ำ */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700">
            ยอดการใช้น้ำรวม (หน่วย)
          </h2>
          <p className="text-4xl font-bold text-indigo-600">8,920</p>
        </div>

        {/* ยอดค้างชำระ */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700">
            ยอดค้างชำระ (บาท)
          </h2>
          <p className="text-4xl font-bold text-indigo-600">4,500</p>
        </div>

        {/* ตารางแสดงรายการ userLog */}
        <div className="col-span-1 md:col-span-3 bg-white shadow-lg rounded-lg p-6">
          <table className="min-w-full table-auto">
            <thead className="border-l-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left text-xl font-semibold text-gray-700">
                  ผู้ใช้
                </th>
                <th className="px-4 py-2 text-left text-xl font-semibold text-gray-700">
                  วันที่
                </th>
                <th className="px-4 py-2 text-left text-xl font-semibold text-gray-700">
                  การกระทำ
                </th>
                <th className="px-4 py-2 text-left text-xl font-semibold text-gray-700">
                  บทบาท
                </th>
              </tr>
            </thead>
            <tbody>
              {userLogs.map((log, index) => (
                <tr
                  key={log.id || index}
                  className="border-b hover:bg-gray-100"
                >
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {log.username}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {log.date.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {log.action}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {log.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
