import { useState, useEffect } from 'react';
import { api } from '../api.js';

const fmt = (s) => (s ? s.replace('_', ' ') : '');

export default function Track({ initialId }) {
  const [id, setId] = useState(initialId || '');
  const [repair, setRepair] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [err, setErr] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
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

  const handlePrint = () => {
    window.print();
  };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>Repair #{repair.id} <span className={`badge ${s}`}>{fmt(s)}</span></h2>
              {s === 'COMPLETED' && (
                <button onClick={() => setShowInvoice(!showInvoice)} style={{ fontSize: '0.85rem' }}>
                  {showInvoice ? 'Hide Invoice' : '📄 View / Print Invoice'}
                </button>
              )}
            </div>
            <p><b>{repair.category.replace('_', ' ')}</b> in {repair.area}: {repair.issue}</p>
            <p className="muted">Customer: {repair.customerName} ({repair.customerPhone})</p>
            <p>
              Technician: {repair.technicianId ? `#${repair.technicianId}` : 'not assigned yet'}
              {repair.quotedAmount != null && <> · Quote: <b>₹{repair.quotedAmount}</b></>}
              {repair.finalAmount != null && <> · Final bill: <b>₹{repair.finalAmount}</b></>}
            </p>
            {repair.completionNotes && (
              <p className="estimate" style={{ margin: '6px 0' }}>
                <b>Technician Completion Notes:</b> {repair.completionNotes}
              </p>
            )}
            {repair.cancellationReason && (
              <p className="error" style={{ margin: '6px 0' }}>
                <b>Cancellation Reason:</b> {repair.cancellationReason}
              </p>
            )}
          </section>

          {/* PRINTABLE INVOICE VIEW */}
          {showInvoice && s === 'COMPLETED' && (
            <section className="card" style={{ background: '#fff', border: '2px solid var(--brand)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--line)', paddingBottom: 12 }}>
                <div>
                  <h2 style={{ margin: 0, color: 'var(--brand)' }}>FixChennai Official Repair Invoice</h2>
                  <p className="muted" style={{ margin: 0 }}>Chennai Municipal Technical Services Network</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <b>Invoice #{repair.id}-{new Date(repair.createdAt).getFullYear()}</b>
                  <p className="muted" style={{ margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '16px 0' }}>
                <div>
                  <h4>Billed To (Customer):</h4>
                  <p style={{ margin: 2 }}><b>{repair.customerName}</b></p>
                  <p style={{ margin: 2 }}>Phone: {repair.customerPhone}</p>
                  <p style={{ margin: 2 }}>Area: {repair.area}, Chennai, Tamil Nadu</p>
                </div>
                <div>
                  <h4>Service Details:</h4>
                  <p style={{ margin: 2 }}>Category: {fmt(repair.category)}</p>
                  <p style={{ margin: 2 }}>Assigned Technician: #{repair.technicianId}</p>
                  <p style={{ margin: 2 }}>Issue Description: {repair.issue}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: 8, textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: 8 }}>Original Agreed Quotation</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>₹{repair.quotedAmount}</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid var(--line)', fontWeight: 'bold' }}>
                    <td style={{ padding: 8 }}>Final Bill (Within Guaranteed Cap)</td>
                    <td style={{ padding: 8, textAlign: 'right', color: 'var(--brand)' }}>₹{repair.finalAmount}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                  ✓ Transparent Pricing Guarantee Applied · Customer verified
                </p>
                <button className="primary" onClick={handlePrint}>Print / Save as PDF</button>
              </div>
            </section>
          )}

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
              <p>The technician quoted <b>₹{repair.quotedAmount}</b>. The final bill can be at most 10% higher (Max: ₹{Math.floor(repair.quotedAmount * 1.10)}).</p>
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
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                Only the verified customer of this completed repair can submit a rating. One review per repair.
              </p>
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

          {open && (
            <div style={{ marginTop: 12 }}>
              {!showCancelPrompt ? (
                <button className="danger" onClick={() => setShowCancelPrompt(true)}>Cancel repair</button>
              ) : (
                <div className="card" style={{ borderColor: 'var(--danger)' }}>
                  <h4>Cancel Repair #{repair.id}</h4>
                  <p className="muted">Please provide a reason for cancellation:</p>
                  <input
                    placeholder="Reason (e.g. Issue resolved, Technician delayed)"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={{ marginBottom: 8, width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="danger"
                      onClick={() => {
                        act(() => api.cancel(repair.id, cancelReason));
                        setShowCancelPrompt(false);
                      }}
                    >
                      Confirm Cancellation
                    </button>
                    <button onClick={() => setShowCancelPrompt(false)}>Back</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
