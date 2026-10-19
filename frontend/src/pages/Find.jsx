import { useState, useEffect } from 'react';
import { api } from '../api.js';

const CATEGORIES = ['WASHING_MACHINE', 'AC', 'REFRIGERATOR', 'TV', 'PLUMBING', 'ELECTRICAL', 'WATER_PURIFIER'];
const label = (c) => c.replace('_', ' ').toLowerCase();

export default function Find({ onBooked }) {
  const [category, setCategory] = useState('WASHING_MACHINE');
  const [area, setArea] = useState('');
  const [sort, setSort] = useState('rating');
  const [techs, setTechs] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ customerName: '', customerPhone: '', issue: '', area: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    setErr('');
    api.searchTechnicians(category, area, sort).then(setTechs).catch((e) => setErr(e.message));
    api.estimate(category).then(setEstimate).catch(() => setEstimate(null));
  }, [category, area, sort]);

  async function book(e) {
    e.preventDefault();
    setErr('');
    try {
      const r = await api.createRepair({ ...form, category, area: form.area || area });
      onBooked(r.id);
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <>
      <section className="card filters">
        <label>Problem with
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
          </select>
        </label>
        <label>Your area
          <input placeholder="e.g. Adyar" value={area} onChange={(e) => setArea(e.target.value)} />
        </label>
        <label>Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="rating">Rating</option>
            <option value="fee">Visit fee</option>
            <option value="experience">Experience</option>
          </select>
        </label>
      </section>

      {estimate && estimate.max > 0 && (
        <p className="estimate">Typical labour cost for {label(category)}: <b>₹{estimate.min} – ₹{estimate.max}</b> (spare parts extra)</p>
      )}
      {err && <p className="error">{err}</p>}

      <div className="grid">
        {techs.map((t) => (
          <article className="card tech" key={t.id}>
            <h3>{t.name} {t.verified && <span className="badge ok">Verified</span>}</h3>
            <p className="muted">Technician ID #{t.id}</p>
            <p>⭐ {t.ratingCount ? `${t.ratingAvg} (${t.ratingCount} reviews)` : 'No reviews yet'}</p>
            <p>{t.experienceYears} yrs experience · Visit fee ₹{t.visitFee}</p>
            <p className="muted">Serves: {t.areas}</p>
          </article>
        ))}
        {!techs.length && !err && <p className="muted">No technicians found for this filter.</p>}
      </div>

      <section className="card">
        <h2>Book a {label(category)} repair</h2>
        <form onSubmit={book}>
          <input required placeholder="Your name" value={form.customerName} onChange={set('customerName')} />
          <input required placeholder="Phone number" value={form.customerPhone} onChange={set('customerPhone')} />
          <input required placeholder="Area (e.g. Adyar)" value={form.area || area} onChange={set('area')} />
          <textarea required placeholder="Describe the problem" value={form.issue} onChange={set('issue')} />
          <button className="primary">Request quote</button>
        </form>
      </section>
    </>
  );
}
