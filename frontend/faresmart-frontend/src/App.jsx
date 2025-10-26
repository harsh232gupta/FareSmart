import { useState } from "react";
import axios from "axios";

export default function App() {
  const [form, setForm] = useState({
    origin_city: "Mangalore",
    destination_city: "Ayodhya",
    date: "2025-11-01",
    max_ground_km: 450
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("price"); // or "none"
  const [limit, setLimit] = useState(10);

  const API_URL = "http://127.0.0.1:8000/find_routes";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: name === "max_ground_km" ? Number(value) : value }));
  };

  const normalizeResults = (data) => {
    // Handle two response shapes:
    // 1) old detailed: objects with airport_iata, airport_name, flight_price_inr, ...
    // 2) simplified: { from_airport, to_airport, flight_price_inr }
    return data.map((r) => {
      if (r.from_airport) {
        return {
          from_iata: r.from_airport,
          to_iata: r.to_airport || form.destination_city,
          price: Number(r.flight_price_inr),
          raw: r,
        };
      }
      // fallback for older shape
      return {
        from_iata: r.airport_iata || r.from_airport,
        to_iata: r.airport_city ? r.airport_city : form.destination_city,
        price: Number(r.flight_price_inr ?? r.total_cost_inr ?? 0),
        distance_km: r.airport_distance_km,
        ground_time: r.ground_time_minutes,
        flight_duration: r.flight_duration_minutes,
        raw: r,
      };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);
    setLoading(true);

    try {
      const res = await axios.post(API_URL, form, { timeout: 15000 });
      let data = res.data;
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format from server");
      }

      let normalized = normalizeResults(data);

      if (sortBy === "price") {
        normalized.sort((a, b) => a.price - b.price);
      }

      setResults(normalized.slice(0, limit));
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError(
        err.response?.data || err.message || "Failed to fetch routes. Is backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "28px auto", fontFamily: "Inter, system-ui, sans-serif", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>FareSmart — Flight options</h1>
        <div style={{ fontSize: 13, color: "#666" }}>Prototype (MVP)</div>
      </header>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr 180px 140px", marginBottom: 12 }}>
        <input
          name="origin_city"
          value={form.origin_city}
          onChange={handleChange}
          placeholder="Origin city (e.g., Mangalore)"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <input
          name="destination_city"
          value={form.destination_city}
          onChange={handleChange}
          placeholder="Destination city (e.g., Ayodhya)"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <input
          name="max_ground_km"
          type="number"
          value={form.max_ground_km}
          onChange={handleChange}
          placeholder="Max ground km"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }}
        />

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
          <button type="submit" style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#0f62fe", color: "#fff", cursor: "pointer" }}>
            {loading ? "Searching..." : "Find flights"}
          </button>

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
            <span style={{ fontSize: 13, color: "#444" }}>Sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
              <option value="price">Cheapest</option>
              <option value="none">None</option>
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
            <span style={{ fontSize: 13, color: "#444" }}>Limit</span>
            <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value || 10))} style={{ width: 64, padding: 6, borderRadius: 6 }} />
          </label>

          <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>
            {results.length > 0 && <span>{results.length} results</span>}
          </div>
        </div>
      </form>

      {error && <div style={{ background: "#ffecec", color: "#a00", padding: 10, borderRadius: 6, marginBottom: 12 }}>{String(error)}</div>}

      <main>
        {!loading && results.length === 0 && (
          <div style={{ color: "#666", padding: 18, border: "1px dashed #eee", borderRadius: 8 }}>
            No results yet — enter origin & destination and click <b>Find flights</b>.
          </div>
        )}

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {results.map((r, idx) => (
            <div key={`${r.from_iata}-${r.to_iata}-${idx}`} style={{ border: "1px solid #e6e9ef", padding: 12, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, background: "#f5f7fb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {r.from_iata}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{r.from_iata} → {r.to_iata}</div>
                  <div style={{ marginLeft: 8, padding: "4px 8px", background: "#eef7ff", color: "#0258d0", borderRadius: 6, fontSize: 12 }}>
                    ₹{r.price.toLocaleString("en-IN")}
                  </div>
                </div>

                <div style={{ color: "#555", marginTop: 6, fontSize: 13 }}>
                  {/* optional extra info from raw object */}
                  {r.raw?.airport_name && <span>{r.raw.airport_name} • </span>}
                  {r.raw?.airport_distance_km != null && <span>{r.raw.airport_distance_km} km • </span>}
                  {r.raw?.flight_duration_minutes != null && <span>{r.raw.flight_duration_minutes} min</span>}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // optional: open booking search (construct a search URL later)
                    alert(`Would open booking flow for ${r.from_iata} → ${r.to_iata}`);
                  }}
                  style={{ display: "inline-block", padding: "8px 12px", background: "#09ad7e", color: "#fff", borderRadius: 6, textDecoration: "none" }}
                >
                  Book / View
                </a>
                <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>#{idx + 1}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
