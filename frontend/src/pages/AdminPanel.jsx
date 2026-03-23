import { useEffect, useState } from "react";
import client from "../api/client";
import { logout } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const DAYS = [
  { label: "MONDAY", value: 1 },
  { label: "TUESDAY", value: 2 },
  { label: "WEDNESDAY", value: 3 },
  { label: "THURSDAY", value: 4 },
  { label: "FRIDAY", value: 5 },
  { label: "SATURDAY", value: 6 },
  { label: "SUNDAY", value: 7 },
];

export default function AdminPanel() {
  const nav = useNavigate();

  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [availabilityRows, setAvailabilityRows] = useState([
    { dayOfWeek: 1, startLocal: "09:00", endLocal: "17:00", slotMinutes: 30 },
  ]);

  const [slotDoctorId, setSlotDoctorId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [apptsRes, doctorsRes] = await Promise.all([
          client.get("/api/appointments/me"),
          client.get("/api/doctors"),
        ]);

        if (!cancelled) {
          setAppts(apptsRes.data || []);
          setDoctors(doctorsRes.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load admin data");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadAppointments() {
    const res = await client.get("/api/appointments/me");
    setAppts(res.data || []);
  }

  async function loadDoctors() {
    const res = await client.get("/api/doctors");
    setDoctors(res.data || []);
  }

  function clearMessages() {
    setMsg("");
    setError("");
  }

  function onLogout() {
    logout();
    nav("/login");
  }

  async function onRefresh() {
    clearMessages();

    try {
      await Promise.all([loadAppointments(), loadDoctors()]);
      setMsg("Admin panel refreshed");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to refresh admin panel");
    }
  }

  async function onCreateDoctor(e) {
    e.preventDefault();
    clearMessages();

    if (!userEmail || !displayName || !specialization) {
      setError("Please fill user email, display name, and specialization");
      return;
    }

    try {
      const res = await client.post("/api/doctors", {
        userEmail,
        displayName,
        specialization,
      });

      setMsg(`Doctor profile created successfully. Doctor ID: ${res.data?.doctorId}`);
      setUserEmail("");
      setDisplayName("");
      setSpecialization("");
      await loadDoctors();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create doctor");
    }
  }

  function addAvailabilityRow() {
    setAvailabilityRows((prev) => [
      ...prev,
      { dayOfWeek: 1, startLocal: "09:00", endLocal: "17:00", slotMinutes: 30 },
    ]);
  }

  function removeAvailabilityRow(index) {
    setAvailabilityRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAvailabilityRow(index, field, value) {
    setAvailabilityRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function onSaveAvailability(e) {
    e.preventDefault();
    clearMessages();

    if (!selectedDoctorId) {
      setError("Please select a doctor");
      return;
    }

    for (const row of availabilityRows) {
      if (!row.dayOfWeek || !row.startLocal || !row.endLocal || !row.slotMinutes) {
        setError("Please fill all availability fields");
        return;
      }

      if (row.startLocal >= row.endLocal) {
        setError("Start time must be earlier than end time");
        return;
      }

      if (Number(row.slotMinutes) <= 0) {
        setError("Slot minutes must be greater than 0");
        return;
      }
    }

    try {
      await client.put(`/api/doctors/${selectedDoctorId}/availability`, availabilityRows);
      setMsg("Availability saved successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save availability");
    }
  }

  async function onGenerateSlots(e) {
    e.preventDefault();
    clearMessages();

    if (!slotDoctorId || !fromDate || !toDate) {
      setError("Please select doctor, from date, and to date");
      return;
    }

    if (fromDate > toDate) {
      setError("From date cannot be after To date");
      return;
    }

    try {
      const res = await client.post(
        `/api/timeslots/generate?doctorId=${slotDoctorId}&from=${fromDate}&to=${toDate}`
      );
      setMsg(`Timeslots generated successfully. Count: ${res.data?.created ?? 0}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate timeslots");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.brandRow}>
          <div style={styles.logoIcon}>D</div>
          <div>
            <div style={styles.brandTitle}>DocBook</div>
            <div style={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <div style={styles.sidebarLabel}>Management</div>
          <div style={styles.sidebarItemActive}>Doctors & Scheduling</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Doctors</div>
          <div style={styles.metricValue}>{doctors.length}</div>
        </div>

        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Appointments</div>
          <div style={styles.metricValue}>{appts.length}</div>
        </div>

        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.pageSubtitle}>
              Manage doctor profiles, availability, timeslots, and appointments.
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

        <div style={styles.gridTwo}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Create Doctor Profile</h3>
                <p style={styles.cardSubtitle}>
                  Attach a doctor profile to an already registered user email.
                </p>
              </div>
            </div>

            <form onSubmit={onCreateDoctor} style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>User Email</label>
                <input
                  type="email"
                  placeholder="User email (must already be registered)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Display Name</label>
                <input
                  type="text"
                  placeholder="Doctor display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Specialization</label>
                <input
                  type="text"
                  placeholder="Specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.primaryButtonWide}>
                Create Doctor
              </button>
            </form>
          </section>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Generate Timeslots</h3>
                <p style={styles.cardSubtitle}>
                  Generate slots for a doctor within a selected date range.
                </p>
              </div>
            </div>

            <form onSubmit={onGenerateSlots} style={styles.formGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Doctor</label>
                <select
                  value={slotDoctorId}
                  onChange={(e) => setSlotDoctorId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- select doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} - {d.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <button type="submit" style={styles.primaryButtonWide}>
                Generate Slots
              </button>
            </form>
          </section>
        </div>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Doctors</h3>
              <p style={styles.cardSubtitle}>
                Current doctor profiles available in the system.
              </p>
            </div>
            <div style={styles.countBadge}>{doctors.length}</div>
          </div>

          {doctors.length === 0 ? (
            <div style={styles.emptyState}>No doctors found.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Display Name</th>
                    <th style={styles.th}>Specialization</th>
                    <th style={styles.th}>User Email</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id} style={styles.tr}>
                      <td style={styles.td}>{d.id}</td>
                      <td style={styles.td}>{d.displayName}</td>
                      <td style={styles.td}>{d.specialization}</td>
                      <td style={styles.td}>{d.userEmail || d.user?.email || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>Set Weekly Availability</h3>
              <p style={styles.cardSubtitle}>
                Configure recurring weekly availability blocks for a doctor.
              </p>
            </div>
          </div>

          <form onSubmit={onSaveAvailability} style={styles.availabilityForm}>
            <div style={{ ...styles.fieldGroup, maxWidth: 420 }}>
              <label style={styles.label}>Select Doctor</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                style={styles.input}
              >
                <option value="">-- select doctor --</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} - {d.displayName} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.availabilityRowsWrap}>
              {availabilityRows.map((row, index) => (
                <div key={index} style={styles.availabilityRow}>
                  <select
                    value={row.dayOfWeek}
                    onChange={(e) =>
                      updateAvailabilityRow(index, "dayOfWeek", Number(e.target.value))
                    }
                    style={styles.input}
                  >
                    {DAYS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={row.startLocal}
                    onChange={(e) =>
                      updateAvailabilityRow(index, "startLocal", e.target.value)
                    }
                    style={styles.input}
                  />

                  <input
                    type="time"
                    value={row.endLocal}
                    onChange={(e) =>
                      updateAvailabilityRow(index, "endLocal", e.target.value)
                    }
                    style={styles.input}
                  />

                  <select
                    value={row.slotMinutes}
                    onChange={(e) =>
                      updateAvailabilityRow(index, "slotMinutes", Number(e.target.value))
                    }
                    style={styles.input}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeAvailabilityRow(index)}
                    style={styles.removeButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.actionRow}>
              <button type="button" onClick={addAvailabilityRow} style={styles.secondaryButton}>
                Add Row
              </button>
              <button type="submit" style={styles.primaryButton}>
                Save Availability
              </button>
            </div>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h3 style={styles.cardTitle}>All Appointments</h3>
              <p style={styles.cardSubtitle}>
                Appointment records currently visible to the admin account.
              </p>
            </div>
            <div style={styles.countBadge}>{appts.length}</div>
          </div>

          {appts.length === 0 ? (
            <div style={styles.emptyState}>No appointments found.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Doctor</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Start (UTC)</th>
                    <th style={styles.th}>End (UTC)</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appts.map((a) => (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}>{a.id}</td>
                      <td style={styles.td}>{a.doctor?.id}</td>
                      <td style={styles.td}>{a.patient?.id}</td>
                      <td style={styles.td}>{a.startTimeUtc}</td>
                      <td style={styles.td}>{a.endTimeUtc}</td>
                      <td style={styles.td}>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    background: "#f5f7fb",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eef2f7",
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

  sidebarSection: {
    display: "grid",
    gap: "10px",
  },

  sidebarLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#9ca3af",
    fontWeight: 700,
  },

  sidebarItemActive: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #dbeafe",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 600,
  },

  metricCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
  },

  metricLabel: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 600,
    marginBottom: "8px",
  },

  metricValue: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
  },

  logoutButton: {
    marginTop: "auto",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  main: {
    padding: "28px",
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

  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
  },

  cardSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  countBadge: {
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

  formGrid: {
    display: "grid",
    gap: "14px",
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

  availabilityForm: {
    display: "grid",
    gap: "14px",
  },

  availabilityRowsWrap: {
    display: "grid",
    gap: "12px",
  },

  availabilityRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto",
    gap: "10px",
    alignItems: "center",
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
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

  primaryButtonWide: {
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "13px 16px",
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

  removeButton: {
    border: "1px solid #fecaca",
    background: "#fff5f5",
    color: "#dc2626",
    borderRadius: "12px",
    padding: "11px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
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
    minWidth: "900px",
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
};