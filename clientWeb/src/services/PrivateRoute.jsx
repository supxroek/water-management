import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

// PrivateRoute component ที่จะใช้สำหรับตรวจสอบ token และ role ของผู้ใช้
export default function PrivateRoute({ children, role }) {
  // ดึง token
  const tokenLocal = localStorage.getItem("token");
  const tokenSession = sessionStorage.getItem("token");

  // ถ้าไม่มี token ให้เปลี่ยนเส้นทางไปที่หน้า login
  if (!tokenLocal && !tokenSession) {
    return <Navigate to="/" replace />;
  }

  try {
    // Decode token เพื่ออ่านข้อมูล role ของผู้ใช้
    const decodedTokenLocal = jwtDecode(tokenLocal);
    const decodedTokenSession = jwtDecode(tokenSession); // เปลี่ยนจาก tokenLocal เป็น tokenSession

    // แทนค่า role จาก decodedTokenLocal หรือ decodedTokenSession ตามที่ต้องการ
    const localRole = decodedTokenLocal.role;
    const sessionRole = decodedTokenSession.role;

    // ถ้า role ของผู้ใช้ไม่ตรงกับ role ที่กำหนดไว้ ให้เปลี่ยนเส้นทางไปที่หน้า unauthorized
    if (localRole !== role && sessionRole !== role) {
      return <Navigate to="/" replace />;
    }

    // ถ้า role ตรงกับที่กำหนดไว้ ให้ render children ที่อยู่ภายใน PrivateRoute (เช่นหน้าที่ต้องการป้องกัน)
  } catch {
    // ถ้ามี error ในการ decode token (เช่น token หมดอายุหรือไม่ถูกต้อง) ให้เปลี่ยนเส้นทางไปที่หน้า login

    return <Navigate to="/" />;
  }

  // ถ้าทุกอย่างถูกต้อง ให้ render children ที่อยู่ภายใน PrivateRoute (เช่นหน้าที่ต้องการป้องกัน)
  return children;
}

// กำหนด propTypes เพื่อให้แน่ใจว่า prop ที่ส่งมานั้นมีประเภทที่ถูกต้อง
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired, // children คือเนื้อหาภายใน route ที่ต้องการป้องกัน
  role: PropTypes.string.isRequired, // role คือสิทธิ์ที่ผู้ใช้ต้องมีเพื่อเข้าถึง route นี้
};
