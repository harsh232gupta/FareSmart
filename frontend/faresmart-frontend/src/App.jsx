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

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:8000/find_routes", form);
    setResults(res.data);
  };

  return (
    <div style={{maxWidth: 900, margin: "40px auto", fontFamily: "system-ui"}}>
      <h1>SmartRoute India (MVP)</h1>
      <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
        <input placeholder="Origin city" value={form.origin_city}
          onChange={e=>setForm({...form, origin_city:e.target.value})}/>
        <input placeholder="Destination city" value={form.destination_city}
          onChange={e=>setForm({...form, destination_city:e.target.value})}/>
        <input type="date" value={form.date}
          onChange={e=>setForm({...form, date:e.target.value})}/>
        <input type="number" placeholder="Max ground km" value={form.max_ground_km}
          onChange={e=>setForm({...form, max_ground_km:Number(e.target.value)})}/>
        <button>Find routes</button>
      </form>

      <div style={{marginTop:24}}>
        {results.map(r => (
          <div key={r.airport_iata} style={{border:"1px solid #ddd", padding:12, borderRadius:8, marginBottom:12}}>
            <h3>{r.airport_iata} — {r.airport_name} ({r.airport_city})</h3>
            <p>Airport distance: {r.airport_distance_km} km • Ground time: {r.ground_time_minutes} min</p>
            <p>Flight: ₹{r.flight_price_inr} • {r.flight_duration_minutes} min</p>
            <p><b>Total: ₹{r.total_cost_inr}</b> • {r.total_time_minutes} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}
