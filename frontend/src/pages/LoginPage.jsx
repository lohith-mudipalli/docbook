import { useState } from "react";
import client from "../api/client";
import { getAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");

  async function onLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await client.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      const { role } = getAuth();
      if(role == "PATIENT") nav("/patient");
      else if(role == "DOCTOR") nav("/doctor");
      else if(role == "ADMIN") nav("/admin");
      else nav("/login");
    } catch(err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div style= {{ padding: 24 }}>
      <h2>DocBook Login</h2>
      <form onSubmit={onLogin} style={{display: "grid", gap: 12, maxwidth: 360}}>
        <input value={email} onChange={ (e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={ (e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button type="submit">Login</button>
        {error && <div style={{ color: "red " }}>{error}</div>}
      </form>

      <p style={{ marginTop: 12, fontSize: 12 }}>
        Tip: Login as Patient/Doctor/Admin using the users created previously
      </p>
    </div>
  );
}

