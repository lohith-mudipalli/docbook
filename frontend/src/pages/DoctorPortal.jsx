import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { logout } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function formatDateTime(value) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString();
}

function getPatientId(appt) {
  return appt?.patient?.id || appt?.patientId || "-";
}

function getPatientName(appt) {
  return (
    appt?.patient?.name ||
    appt?.patient?.displayName ||
    appt?.patient?.fullName ||
    appt?.patient?.user?.name ||
    appt?.patientName ||
    "-"
  );
}

function getPatientEmail(appt) {
  return (
    appt?.patient?.email ||
    appt?.patient?.user?.email ||
    appt?.patientEmail ||
    "-"
  );
}

function getStatusBadgeStyle(status) {
  switch (status) {
    case "BOOKED":
    case "CONFIRMED":
      return {
        background: "#ecfdf5",
        color: "#059669",
        border: "1px solid #a7f3d0",
      };
    case "CANCELLED":
      return {
        background: "#fef2f2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      };
    case "PENDING":
      return {
        background: "#fff7ed",
        color: "#ea580c",
        border: "1px solid #fed7aa",
      };
    default:
      return {
        background: "#f3f4f6",
        color: "#374151",
        border: "1px solid #e5e7eb",
      };
  }
}

function AppointmentTable({ title, subtitle, appointments }) {
  return (
    <section style={styles.tableSection}>
      <div style={styles.sectionHeader}>
        <div>
          <h3 style={styles.sectionTitle}>{title}</h3>
          <p style={styles.sectionSubtitle}>{subtitle}</p>
        </div>
        <div style={styles.sectionCount}>{appointments.length}</div>
      </div>

      {appointments.length === 0 ? (
        <div style={styles.emptyState}>No appointments in this section.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Patient ID</th>
                <th style={styles.th}>Patient Name</th>
                <th style={styles.th}>Patient Email</th>
                <th style={styles.th}>Start Time</th>
                <th style={styles.th}>End Time</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} style={styles.tr}>
                  <td style={styles.td}>{a.id}</td>
                  <td style={styles.td}>{getPatientId(a)}</td>
                  <td style={styles.td}>{getPatientName(a)}</td>
                  <td style={styles.td}>{getPatientEmail(a)}</td>
                  <td style={styles.td}>{formatDateTime(a.startTimeUtc)}</td>
                  <td style={styles.td}>{formatDateTime(a.endTimeUtc)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...getStatusBadgeStyle(a.status),
                      }}
                    >
                      {a.status || "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function DoctorPortal() {
  const nav = useNavigate();

  const [appts, setAppts] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [currentTimeMs, setCurrentTimeMs] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await client.get("/api/appointments/me");

        if (!cancelled) {
          setAppts(res.data || []);
          setCurrentTimeMs(new Date().getTime());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load appointments");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function onRefresh() {
    setMsg("");
    setError("");

    try {
      const res = await client.get("/api/appointments/me");
      setAppts(res.data || []);
      setCurrentTimeMs(new Date().getTime());
      setMsg("Appointments refreshed");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load appointments");
    }
  }

  function onLogout() {
    logout();
    nav("/login");
  }

  const sortedAppointments = useMemo(() => {
    return [...appts].sort((a, b) => {
      const aTime = new Date(a.startTimeUtc).getTime();
      const bTime = new Date(b.startTimeUtc).getTime();
      return aTime - bTime;
    });
  }, [appts]);

  const cancelledAppointments = useMemo(() => {
    return sortedAppointments.filter((a) => a.status === "CANCELLED");
  }, [sortedAppointments]);

  const upcomingAppointments = useMemo(() => {
    if (currentTimeMs == null) return [];

    return sortedAppointments.filter((a) => {
      if (a.status === "CANCELLED") return false;
      const start = new Date(a.startTimeUtc).getTime();
      return !Number.isNaN(start) && start >= currentTimeMs;
    });
  }, [sortedAppointments, currentTimeMs]);

  const pastAppointments = useMemo(() => {
    if (currentTimeMs == null) return [];

    return sortedAppointments.filter((a) => {
      if (a.status === "CANCELLED") return false;
      const start = new Date(a.startTimeUtc).getTime();
      return !Number.isNaN(start) && start < currentTimeMs;
    });
  }, [sortedAppointments, currentTimeMs]);

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.brandRow}>
          <div style={styles.logoIcon}>D</div>
          <div>
            <div style={styles.brandTitle}>DocBook</div>
            <div style={styles.brandSub}>Doctor Portal</div>
          </div>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Upcoming</div>
            <div style={styles.summaryValue}>{upcomingAppointments.length}</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Past</div>
            <div style={styles.summaryValue}>{pastAppointments.length}</div>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Cancelled</div>
            <div style={styles.summaryValue}>{cancelledAppointments.length}</div>
          </div>
        </div>
      </div>

      <div style={styles.mainPanel}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Doctor Dashboard</h1>
            <p style={styles.pageSubtitle}>
              View all appointments assigned to your account.
            </p>
          </div>

          <div style={styles.topbarButtons}>
            <button onClick={onRefresh} style={styles.secondaryButton}>
              Refresh
            </button>
            <button onClick={onLogout} style={styles.primaryButton}>
              Logout
            </button>
          </div>
        </div>

        {msg && <div style={styles.success}>{msg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <AppointmentTable
          title="Upcoming Appointments"
          subtitle="Future non-cancelled appointments assigned to you."
          appointments={upcomingAppointments}
        />

        <AppointmentTable
          title="Past Appointments"
          subtitle="Completed or already-started non-cancelled appointments."
          appointments={pastAppointments}
        />

        <AppointmentTable
          title="Cancelled Appointments"
          subtitle="Appointments that were cancelled."
          appointments={cancelledAppointments}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    background: "#f5f7fb",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  leftPanel: {
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #60a5fa)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.22)",
  },

  brandTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },

  brandSub: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },

  summaryGrid: {
    display: "grid",
    gap: "12px",
    marginTop: "8px",
  },

  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
  },

  summaryLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 600,
    marginBottom: "8px",
  },

  summaryValue: {
    fontSize: "28px",
    lineHeight: 1,
    fontWeight: 700,
    color: "#111827",
  },

  mainPanel: {
    padding: "30px",
    display: "grid",
    gap: "20px",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
    color: "#111827",
  },

  pageSubtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  topbarButtons: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  primaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.16)",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "12px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  success: {
    background: "#ecfdf5",
    color: "#059669",
    border: "1px solid #a7f3d0",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
  },

  error: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
  },

  tableSection: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#111827",
  },

  sectionSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  sectionCount: {
    minWidth: "40px",
    height: "40px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "14px",
  },

  emptyState: {
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    padding: "20px",
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    background: "#fafafa",
  },

  tableWrap: {
    overflowX: "auto",
    border: "1px solid #eef2f7",
    borderRadius: "16px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
    background: "#ffffff",
  },

  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#374151",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #eef2f7",
  },

  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#111827",
    verticalAlign: "top",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};