import { useState } from "react";
import client from "../api/client";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function onRegister(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      await client.post("/api/auth/register", { email, password });
      setMsg("Account created successfully. Please login.");
      setTimeout(() => nav("/login"), 700);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow}></div>

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>D</div>
          <div>
            <h2 style={styles.brand}>DocBook</h2>
            <p style={styles.brandSub}>Healthcare Appointment Platform</p>
          </div>
        </div>

        <div style={styles.headerBlock}>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>
            Register as a patient to book and manage appointments.
          </p>
        </div>

        <form onSubmit={onRegister} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {msg && <div style={styles.success}>{msg}</div>}
          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.primaryButton}>
            Create Account
          </button>
        </form>

        <div style={styles.dividerWrap}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine}></div>
        </div>

        <div style={styles.bottomSection}>
          <p style={styles.loginText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "radial-gradient(circle at top, #eaf3ff 0%, #f8fbff 35%, #ffffff 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  backgroundGlow: {
    position: "absolute",
    width: "520px",
    height: "520px",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.05) 35%, rgba(255,255,255,0) 70%)",
    top: "-120px",
    left: "-120px",
    borderRadius: "50%",
    pointerEvents: "none",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "32px",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08), 0 20px 60px rgba(15, 23, 42, 0.06)",
    position: "relative",
    zIndex: 1,
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },

  logoIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.25)",
  },

  brand: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },

  brandSub: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },

  headerBlock: {
    marginBottom: "22px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1.1,
  },

  subtitle: {
    margin: "10px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  },

  success: {
    background: "#ecfdf5",
    color: "#059669",
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "14px",
  },

  error: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "14px",
  },

  primaryButton: {
    marginTop: "4px",
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "13px 16px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.22)",
  },

  dividerWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0 18px",
  },

  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },

  dividerText: {
    fontSize: "13px",
    color: "#9ca3af",
  },

  bottomSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    alignItems: "center",
  },

  loginText: {
    margin: 0,
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  loginLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
};