import { useState } from 'react';
import { api } from '../api.js';

export default function History({ onOpen }) {
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');

  async function search() {
    setErr('');
    try { setItems(await api.history(phone)); } catch (e) { setErr(e.message); }
  }

  return (
    <>
      <section className="card inline">
        <input placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button className="primary" onClick={search}>Show my repairs</button>
      </section>
      {err && <p className="error">{err}</p>}
      {items && !items.length && <p className="muted">No repairs found for this number.</p>}
      {items && items.map((r) => (
        <article className="card row" key={r.id}>
          <div>
            <h3>#{r.id} · {r.category.replace('_', ' ')} <span className={`badge ${r.status}`}>{r.status.replace('_', ' ')}</span></h3>
            <p className="muted">{r.issue} · {new Date(r.createdAt).toLocaleDateString()}</p>
            <p>{r.finalAmount != null ? `Final bill ₹${r.finalAmount}` : r.quotedAmount != null ? `Quote ₹${r.quotedAmount}` : 'Awaiting quote'}</p>
          </div>
          <button onClick={() => onOpen(r.id)}>Open</button>
        </article>
      ))}
    </>
  );
}
