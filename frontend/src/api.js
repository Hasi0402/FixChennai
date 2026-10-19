async function call(url, opts = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && (data.message || data.error)) || `Request failed (${res.status})`);
  return data;
}
const post = (url, body) => call(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export const api = {
  estimate: (category) => call(`/api/repairs/estimate?category=${category}`),
  searchTechnicians: (category, area, sort) =>
    call(`/api/technicians?${new URLSearchParams({ category, sort, ...(area ? { area } : {}) })}`),
  createRepair: (body) => post('/api/repairs', body),
  repair: (id) => call(`/api/repairs/${id}`),
  timeline: (id) => call(`/api/repairs/${id}/timeline`),
  history: (phone) => call(`/api/repairs?phone=${encodeURIComponent(phone)}`),
  quote: (id, body) => post(`/api/repairs/${id}/quote`, body),
  accept: (id) => post(`/api/repairs/${id}/accept`),
  start: (id) => post(`/api/repairs/${id}/start`),
  complete: (id, finalAmount) => post(`/api/repairs/${id}/complete`, { finalAmount }),
  cancel: (id) => post(`/api/repairs/${id}/cancel`),
  review: (body) => post('/api/reviews', body)
};
