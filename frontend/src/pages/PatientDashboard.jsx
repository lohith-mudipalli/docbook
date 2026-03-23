import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { logout } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

function getUtcWindow(days = 7) {
  const from = new Date();
  const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);

  return {
    fromUtc: from.toISOString().slice(0, 19) + "Z",
    toUtc: to.toISOString().slice(0, 19) + "Z",
  };
}

function formatDateTime(value) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString();
}

export default function PatientDashboard() {
  const nav = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoadingDoctors(true);
      setError("");

      try {
        const res = await client.get("/api/doctors");
        if (!cancelled) {
          setDoctors(res.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load doctors");
        }
      } finally {
        if (!cancelled) {
          setLoadingDoctors(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;

    return doctors.filter((d) => {
      const name = d.displayName?.toLowerCase() || "";
      const specialization = d.specialization?.toLowerCase() || "";
      return name.includes(q) || specialization.includes(q);
    });
  }, [doctors, query]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  async function loadSlots(doctorId) {
    setMsg("");
    setError("");
    setSelectedDoctorId(doctorId);
    setLoadingSlots(true);

    try {
      const { fromUtc, toUtc } = getUtcWindow(7);

      const res = await client.get("/api/timeslots", {
        params: { doctorId, fromUtc, toUtc },
      });

      setSlots(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load available slots");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const events = useMemo(() => {
    return slots.map((s) => ({
      id: String(s.id),
      title: "Available",
      start: s.startTimeUtc,
      end: s.endTimeUtc,
    }));
  }, [slots]);

  function onEventClick(info) {
    setMsg("");
    setError("");

    const slot = slots.find((s) => String(s.id) === info.event.id);
    if (!slot) {
      setError("Could not read selected slot");
      return;
    }

    setSelectedSlot(slot);
    setConfirmOpen(true);
  }

  function closeConfirmModal() {
    if (booking) return;
    setConfirmOpen(false);
    setSelectedSlot(null);
  }

  async function confirmBooking() {
    if (!selectedSlot) return;

    setBooking(true);
    setMsg("");
    setError("");

    try {
      const res = await client.post("/api/appointments/book", {
        timeslotId: selectedSlot.id,
      });

      setMsg(`Booked successfully! Appointment ID: ${res.data?.appointmentId}`);
      setConfirmOpen(false);
      setSelectedSlot(null);

      if (selectedDoctorId) {
        await loadSlots(selectedDoctorId);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.logoIcon}>D</div>
          <div>
            <div style={styles.sidebarBrandTitle}>DocBook</div>
            <div style={styles.sidebarBrandSub}>Patient Portal</div>
          </div>
        </div>

        <div style={styles.sidebarSection}>
          <div style={styles.sidebarLabel}>Dashboard</div>
          <div style={styles.sidebarItemActive}>Book Appointment</div>
        </div>

        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Patient Dashboard</h1>
            <p style={styles.pageSubtitle}>
              Search doctors, view availability, and book appointments.
            </p>
          </div>

          <div style={styles.topbarRight}>
            <div style={styles.topBadge}>7-Day Availability View</div>
          </div>
        </div>

        {msg && <div style={styles.success}>{msg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.heroRow}>
          <div style={styles.heroCard}>
            <div style={styles.heroLabel}>Search doctors</div>
            <input
              placeholder="Search by doctor name or specialization..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTitle}>Doctors</div>
            <div style={styles.statValue}>{doctors.length}</div>
            <div style={styles.statSub}>Available in directory</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statTitle}>Visible Results</div>
            <div style={styles.statValue}>{filtered.length}</div>
            <div style={styles.statSub}>Match your search</div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h3 style={styles.panelTitle}>Doctors</h3>
                <p style={styles.panelSubtitle}>
                  Choose a doctor to load available timeslots.
                </p>
              </div>
            </div>

            <div style={styles.doctorList}>
              {loadingDoctors && (
                <div style={styles.emptyState}>Loading doctors...</div>
              )}

              {!loadingDoctors && filtered.length === 0 && (
                <div style={styles.emptyState}>No doctors found.</div>
              )}

              {!loadingDoctors &&
                filtered.map((d) => {
                  const isSelected = d.id === selectedDoctorId;

                  return (
                    <div
                      key={d.id}
                      style={{
                        ...styles.doctorCard,
                        ...(isSelected ? styles.doctorCardSelected : {}),
                      }}
                    >
                      <div style={styles.doctorTopRow}>
                        <div>
                          <div style={styles.doctorName}>{d.displayName}</div>
                          <div style={styles.doctorSpec}>{d.specialization}</div>
                        </div>

                        {isSelected && (
                          <span style={styles.selectedBadge}>Selected</span>
                        )}
                      </div>

                      <button
                        style={
                          isSelected
                            ? styles.secondaryButton
                            : styles.primarySmallButton
                        }
                        onClick={() => loadSlots(d.id)}
                      >
                        {isSelected ? "Reload Availability" : "View Availability"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h3 style={styles.panelTitle}>Availability Calendar</h3>
                <p style={styles.panelSubtitle}>
                  Click an available slot to confirm your appointment.
                </p>
              </div>
            </div>

            {!selectedDoctorId && (
              <div style={styles.emptyStateLarge}>
                Select a doctor from the left panel to load available slots.
              </div>
            )}

            {selectedDoctorId && selectedDoctor && (
              <div style={styles.selectedDoctorBanner}>
                Showing availability for{" "}
                <strong>{selectedDoctor.displayName}</strong> —{" "}
                {selectedDoctor.specialization}
              </div>
            )}

            {loadingSlots && (
              <div style={styles.emptyStateLarge}>Loading available slots...</div>
            )}

            {selectedDoctorId && !loadingSlots && (
              <div style={styles.calendarWrap}>
                <FullCalendar
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  events={events}
                  eventClick={onEventClick}
                  height={650}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && selectedSlot && (
        <div onClick={closeConfirmModal} style={styles.modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Confirm Appointment Booking</h3>
                <p style={styles.modalSubtitle}>
                  Review the details before confirming.
                </p>
              </div>
            </div>

            <div style={styles.modalDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Doctor</span>
                <span style={styles.detailValue}>
                  {selectedDoctor
                    ? `${selectedDoctor.displayName} (${selectedDoctor.specialization})`
                    : "-"}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Start</span>
                <span style={styles.detailValue}>
                  {formatDateTime(selectedSlot.startTimeUtc)}
                </span>
              </div>

              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>End</span>
                <span style={styles.detailValue}>
                  {formatDateTime(selectedSlot.endTimeUtc)}
                </span>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={closeConfirmModal}
                disabled={booking}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={booking}
                style={styles.modalConfirm}
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
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
    gap: "24px",
  },

  sidebarBrand: {
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

  sidebarBrandTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
  },

  sidebarBrandSub: {
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

  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  topBadge: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#374151",
    borderRadius: "999px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
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

  heroRow: {
    display: "grid",
    gridTemplateColumns: "1.6fr 0.7fr 0.7fr",
    gap: "16px",
  },

  heroCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  },

  heroLabel: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#374151",
    marginBottom: "12px",
  },

  searchInput: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  },

  statCard: {
    background: "linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  statTitle: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 600,
    marginBottom: "8px",
  },

  statValue: {
    fontSize: "30px",
    lineHeight: 1,
    fontWeight: 700,
    color: "#111827",
  },

  statSub: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#9ca3af",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "360px 1fr",
    gap: "16px",
    alignItems: "start",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },

  panelHeader: {
    marginBottom: "16px",
  },

  panelTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#111827",
  },

  panelSubtitle: {
    margin: "6px 0 0 0",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  doctorList: {
    display: "grid",
    gap: "12px",
  },

  doctorCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "14px",
    background: "#ffffff",
  },

  doctorCardSelected: {
    border: "1px solid #bfdbfe",
    background: "#f8fbff",
    boxShadow: "0 0 0 3px rgba(59,130,246,0.08)",
  },

  doctorTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
    marginBottom: "12px",
  },

  doctorName: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "4px",
  },

  doctorSpec: {
    fontSize: "13px",
    color: "#6b7280",
  },

  selectedBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  primarySmallButton: {
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.16)",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  emptyState: {
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    padding: "18px",
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    background: "#fafafa",
  },

  emptyStateLarge: {
    border: "1px dashed #d1d5db",
    borderRadius: "16px",
    padding: "28px",
    color: "#6b7280",
    fontSize: "14px",
    textAlign: "center",
    background: "#fafafa",
    marginTop: "6px",
  },

  selectedDoctorBanner: {
    marginBottom: "14px",
    padding: "12px 14px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    borderRadius: "14px",
    color: "#1e3a8a",
    fontSize: "14px",
  },

  calendarWrap: {
    border: "1px solid #eef2f7",
    borderRadius: "16px",
    padding: "12px",
    background: "#ffffff",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 9999,
  },

  modalCard: {
    width: "100%",
    maxWidth: "520px",
    background: "#ffffff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
  },

  modalHeader: {
    marginBottom: "18px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 700,
    color: "#111827",
  },

  modalSubtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  modalDetails: {
    display: "grid",
    gap: "12px",
    marginBottom: "22px",
  },

  detailRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    gap: "12px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    alignItems: "start",
  },

  detailLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#6b7280",
  },

  detailValue: {
    fontSize: "14px",
    color: "#111827",
    wordBreak: "break-word",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  modalCancel: {
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "12px",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  modalConfirm: {
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
};