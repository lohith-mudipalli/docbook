import { useEffect, useState } from "react";
import client from "../api/client";
import { logout } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const nav = useNavigate();
  const [appts, setAppts] = useState([]);

  useEffect(() => {
    client.get("/api/appointments/me").then((res) => setAppts(res.data));
  }, []);

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin Panel</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <h3>All Appointments</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Doctor</th>
            <th>Patient</th>
            <th>Start (UTC)</th>
            <th>End (UTC)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appts.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.doctor?.id}</td>
              <td>{a.patient?.id}</td>
              <td>{a.startTimeUtc}</td>
              <td>{a.endTimeUtc}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}