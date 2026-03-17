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

export default function PatientDashboard() {
  const nav = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    client.get("/api/doctors").then((res) => setDoctors(res.data));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(
      (d) =>
        d.displayName.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q)
    );
  }, [doctors, query]);

  async function loadSlots(doctorId) {
    setMsg("");
    setSelectedDoctorId(doctorId);

    const { fromUtc, toUtc } = getUtcWindow(7);

    const res = await client.get("/api/timeslots", {
      params: { doctorId, fromUtc, toUtc },
    });

    setSlots(res.data);
  }

  const events = slots.map((s) => ({
    id: String(s.id),
    title: "Available",
    start: s.startTimeUtc,
    end: s.endTimeUtc,
  }));

  async function onEventClick(info) {
    setMsg("");
    const timeslotId = Number(info.event.id);

    try {
      const res = await client.post("/api/appointments/book", { timeslotId });
      setMsg(`Booked! Appointment ID: ${res.data.appointmentId}`);

      if (selectedDoctorId) {
        await loadSlots(selectedDoctorId);
      }
    } catch (err) {
      setMsg(err?.response?.data?.message || "Booking failed");
    }
  }

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <div style={{ padding: 24, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Patient Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <input
        placeholder="Search doctors by name or specialization..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ maxWidth: 420 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
        <div style={{ border: "1px solid #333", padding: 12, borderRadius: 8 }}>
          <h3>Doctors</h3>
          {filtered.map((d) => (
            <div key={d.id} style={{ padding: 8, borderBottom: "1px solid #222" }}>
              <div><b>{d.displayName}</b></div>
              <div style={{ fontSize: 12 }}>{d.specialization}</div>
              <button style={{ marginTop: 6 }} onClick={() => loadSlots(d.id)}>
                View Availability
              </button>
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid #333", padding: 12, borderRadius: 8 }}>
          <h3>Calendar</h3>
          {!selectedDoctorId && <div>Select a doctor to load available slots.</div>}

          {selectedDoctorId && (
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              events={events}
              eventClick={onEventClick}
              height={650}
            />
          )}

          {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}