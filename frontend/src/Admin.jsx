import React, { useState } from "react";

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState("");
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(auth ? { Authorization: `Basic ${auth}` } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status}: ${body}`);
    }

    return response.json();
  }

  async function loadData(token = auth) {
    setLoading(true);
    setError("");

    try {
      const headers = { Authorization: `Basic ${token}` };

      const [bookingResponse, contactResponse] = await Promise.all([
        fetch(`${API}/api/admin/bookings`, { headers }),
        fetch(`${API}/api/admin/contacts`, { headers }),
      ]);

      if (!bookingResponse.ok || !contactResponse.ok) {
        const failed = !bookingResponse.ok ? bookingResponse : contactResponse;
        throw new Error(`HTTP ${failed.status}: ${await failed.text()}`);
      }

      setBookings(await bookingResponse.json());
      setContacts(await contactResponse.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(e) {
    e.preventDefault();
    setError("");

    const token = btoa(`${username}:${password}`);
    setAuth(token);
    await loadData(token);
  }

  async function updateStatus(id, status) {
    setError("");

    try {
      await request(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  function logout() {
    setAuth("");
    setUsername("");
    setPassword("");
    setBookings([]);
    setContacts([]);
    setError("");
  }

  if (!auth) {
    return (
      <main style={styles.page}>
        <form onSubmit={login} style={styles.login}>
          <h1>PANDM Admin Login</h1>
          <label>Username</label>
          <input
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <h1>PANDM Admin Dashboard</h1>
        <div>
          <button style={styles.button} onClick={() => loadData()}>
            Refresh
          </button>{" "}
          <button style={styles.secondary} onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <p style={styles.error}>{error}</p>}
      {loading && <p>Loading...</p>}

      <h2>Bookings ({bookings.length})</h2>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
              <th>Project</th><th>Details</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td>{b.id}</td><td>{b.name}</td><td>{b.email}</td>
                <td>{b.phone}</td><td>{b.project_type}</td><td>{b.details}</td>
                <td>
                  <select
                    value={b.status}
                    onChange={e => updateStatus(b.id, e.target.value)}
                  >
                    {[
                      { value: "new", label: "New" },
                      { value: "contacted", label: "Contacted" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "completed", label: "Completed" },
                      { value: "cancelled", label: "Cancelled" },
                    ].map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Contact Messages ({contacts.length})</h2>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th></tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.name}</td>
                <td>{c.email}</td><td>{c.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const styles = {
  page: {
    maxWidth: 1400,
    margin: "24px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#172033",
    background: "#f8fafc",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  login: {
    maxWidth: 380,
    margin: "70px auto",
    padding: 28,
    display: "grid",
    gap: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
    padding: 20,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  tableWrap: {
    overflowX: "auto",
    marginBottom: 28,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 850,
    textAlign: "left",
  },
  button: {
    padding: "10px 16px",
    background: "#4338ca",
    color: "#fff",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 600,
  },
  secondary: {
    padding: "10px 16px",
    background: "#e2e8f0",
    color: "#172033",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: 12,
    whiteSpace: "pre-wrap",
  },
};

