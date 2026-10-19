import { useState, useEffect } from 'react';
import { api } from '../api.js';

const fmt = (s) => s.replace('_', ' ');

export default function Track({ initialId }) {
  const [id, setId] = useState(initialId || '');
  const [repair, setRepair] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [err, setErr] = useState('');
  const [f, setF] = useState({ techId: '', amount: '', note: '', finalAmount: '', phone: '', rating: 5, comment: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function load(rid = id) {
    if (!rid) return;
    setErr('');
    try {
      setRepair(await api.repair(rid));
      setTimeline(await api.timeline(rid));
    } catch (e) { setRepair(null); setErr(e.message); }
  }
  useEffect(() => { if (initialId) load(initialId); }, [initialId]);

  async function act(fn) {
    setErr('');
    try { await fn(); await load(repair.id); } catch (e) { setErr(e.message); }
  }

  const s = repair?.status;
  const open = s && s !== 'COMPLETED' && s !== 'CANCELLED';

  return (
    <>
      <section className="card inline">
        <input placeholder="Repair ID" value={id} onChange={(e) => setId(e.target.value)} />
        <button className="primary" onClick={() => load()}>Load</button>
      </section>
      {err && <p className="error">{err}</p>}

      {repair && (
        <>
          <section className="card">
            <h2>Repair #{repair.id} <span className={`badge ${s}`}>{fmt(s)}</span></h2>
            <p><b>{repair.category.replace('_', ' ')}</b> in {repair.area}: {repair.issue}</p>
            <p className="muted">Customer: {repair.customerName} ({repair.customerPhone})</p>
            <p>
              Technician: {repair.technicianId ? `#${repair.technicianId}` : 'not assigned yet'}
              {repair.quotedAmount != null && <> · Quote: <b>₹{repair.quotedAmount}</b></>}
              {repair.finalAmount != null && <> · Final bill: <b>₹{repair.finalAmount}</b></>}
            </p>
          </section>

          <section className="card">
            <h2>Timeline</h2>
            <ol className="timeline">
              {timeline.map((e) => (
                <li key={e.id}>
                  <b>{fmt(e.status)}</b> <span className="muted">{new Date(e.at).toLocaleString()}</span>
                  <div>{e.note}</div>
                </li>
              ))}
            </ol>
          </section>

          {(s === 'REQUESTED' || s === 'QUOTED') && (
            <section className="card">
              <h2>Technician: send a quote</h2>
              <div className="inline">
                <input placeholder="Technician ID" value={f.techId} onChange={set('techId')} />
                <input type="number" placeholder="Amount ₹" value={f.amount} onChange={set('amount')} />
                <input placeholder="What the quote covers" value={f.note} onChange={set('note')} />
                <button className="primary" onClick={() => act(() => api.quote(repair.id,
                  { technicianId: Number(f.techId), amount: Number(f.amount), note: f.note }))}>Send quote</button>
              </div>
            </section>
          )}

          {s === 'QUOTED' && (
            <section className="card">
              <h2>Customer: review the quote</h2>
              <p>The technician quoted <b>₹{repair.quotedAmount}</b>. The final bill can be at most 10% higher.</p>
              <button className="primary" onClick={() => act(() => api.accept(repair.id))}>Accept quote</button>
            </section>
          )}

          {s === 'ACCEPTED' && (
            <section className="card">
              <h2>Technician: start the work</h2>
              <button className="primary" onClick={() => act(() => api.start(repair.id))}>Start work</button>
            </section>
          )}

          {s === 'IN_PROGRESS' && (
            <section className="card">
              <h2>Technician: complete the job</h2>
              <div className="inline">
                <input type="number" placeholder="Final bill ₹" value={f.finalAmount} onChange={set('finalAmount')} />
                <button className="primary" onClick={() => act(() => api.complete(repair.id, Number(f.finalAmount)))}>Mark completed</button>
              </div>
            </section>
          )}

          {s === 'COMPLETED' && (
            <section className="card">
              <h2>Leave a review</h2>
              <div className="inline">
                <input placeholder="Your phone (same as booking)" value={f.phone} onChange={set('phone')} />
                <select value={f.rating} onChange={set('rating')}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                </select>
                <input placeholder="Comment" value={f.comment} onChange={set('comment')} />
                <button className="primary" onClick={() => act(async () => {
                  await api.review({ repairId: repair.id, customerPhone: f.phone, rating: Number(f.rating), comment: f.comment });
                  alert('Thanks for your review!');
                })}>Submit</button>
              </div>
            </section>
          )}

          {open && <button className="danger" onClick={() => act(() => api.cancel(repair.id))}>Cancel repair</button>}
        </>
      )}
    </>
  );
}
