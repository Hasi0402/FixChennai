import { useState, useEffect } from 'react';
import { api } from '../api.js';

const CATEGORIES = ['WASHING_MACHINE', 'AC', 'REFRIGERATOR', 'TV', 'PLUMBING', 'ELECTRICAL', 'WATER_PURIFIER'];
const label = (c) => c.replace('_', ' ').toLowerCase();

export default function Find({ onBooked }) {
  const [category, setCategory] = useState('WASHING_MACHINE');
  const [area, setArea] = useState('');
  const [sort, setSort] = useState('rating');
  const [availabilityFilter, setAvailabilityFilter] = useState(''); // '' | 'true'
  const [verifiedFilter, setVerifiedFilter] = useState(''); // '' | 'true'
  const [techs, setTechs] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ customerName: '', customerPhone: '', issue: '', area: '' });
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    setErr('');
    api.searchTechnicians(
      category,
      area,
      sort,
      availabilityFilter === '' ? undefined : availabilityFilter === 'true',
      verifiedFilter === '' ? undefined : verifiedFilter === 'true'
    )
      .then(setTechs)
      .catch((e) => setErr(e.message));
    api.estimate(category).then(setEstimate).catch(() => setEstimate(null));
  }, [category, area, sort, availabilityFilter, verifiedFilter]);

  async function book(e) {
    e.preventDefault();
    setErr('');
    try {
      const r = await api.createRepair({ ...form, category, area: form.area || area });
      onBooked(r.id);
    } catch (ex) { setErr(ex.message); }
  }

  const toggleCompare = (tech) => {
    if (compareList.find((t) => t.id === tech.id)) {
      setCompareList(compareList.filter((t) => t.id !== tech.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare up to 3 technicians at a time.');
        return;
      }
      setCompareList([...compareList, tech]);
    }
  };

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
        <label>Availability
          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
            <option value="">All Technicians</option>
            <option value="true">Available Now (Online)</option>
          </select>
        </label>
        <label>Verification
          <select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">Verified Only</option>
          </select>
        </label>
      </section>

      {estimate && estimate.max > 0 && (
        <p className="estimate">Typical labour cost for {label(category)}: <b>₹{estimate.min} – ₹{estimate.max}</b> (spare parts extra)</p>
      )}
      {err && <p className="error">{err}</p>}

      {compareList.length > 0 && (
        <div className="card row" style={{ background: '#f0fdfa', borderColor: 'var(--brand)' }}>
          <div>
            <b>Comparing {compareList.length} technician(s):</b> {compareList.map((t) => t.name).join(', ')}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" onClick={() => setShowCompare(true)}>View Comparison</button>
            <button onClick={() => setCompareList([])}>Clear</button>
          </div>
        </div>
      )}

      {showCompare && (
        <section className="card" style={{ borderColor: 'var(--brand)', borderWidth: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Technician Comparison</h2>
            <button onClick={() => setShowCompare(false)}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: 12, marginTop: 12 }}>
            {compareList.map((t) => (
              <div key={t.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                <h4>{t.name} {t.verified && <span className="badge ok">Verified</span>}</h4>
                <p><b>Rating:</b> ⭐ {t.ratingCount ? `${t.ratingAvg} (${t.ratingCount})` : 'New'}</p>
                <p><b>Visit Fee:</b> ₹{t.visitFee}</p>
                <p><b>Experience:</b> {t.experienceYears} Years</p>
                <p><b>Status:</b> {t.available ? '🟢 Available' : '🔴 Busy'}</p>
                <p className="muted"><b>Serves:</b> {t.areas}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid">
        {techs.map((t) => {
          const isComparing = !!compareList.find((item) => item.id === t.id);
          return (
            <article className="card tech" key={t.id}>
              <h3>
                {t.name} {t.verified && <span className="badge ok">Verified</span>}
                {t.available ? (
                  <span className="badge ok" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Available</span>
                ) : (
                  <span className="badge" style={{ marginLeft: 6, fontSize: '0.65rem' }}>Busy</span>
                )}
              </h3>
              <p className="muted">Technician ID #{t.id}</p>
              <p>⭐ {t.ratingCount ? `${t.ratingAvg} (${t.ratingCount} reviews)` : 'No reviews yet'}</p>
              <p>{t.experienceYears} yrs experience · Visit fee ₹{t.visitFee}</p>
              <p className="muted">Serves: {t.areas}</p>
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                  onClick={() => toggleCompare(t)}
                >
                  {isComparing ? '✓ Comparing' : '+ Compare'}
                </button>
              </div>
            </article>
          );
        })}
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
