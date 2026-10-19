# FixChennai Frontend (React + Vite + CSS)

## Run
1. Start the backend (see the backend README); the API gateway must be on http://localhost:8080
2. In this folder:
```
npm install
npm run dev
```
3. Open http://localhost:5173

Vite proxies `/api` to the gateway, so no CORS setup is needed in development.

## Pages
- **Find a technician**: filter by problem and area, sort by rating/fee/experience, see the price guide, book a repair.
- **Track repair**: status, quote, timeline, and the next action (quote / accept / start / complete / review / cancel).
- **My history**: all repairs for a phone number.

## Notes
- There is no login yet, so the technician actions (quote, start, complete) are shown to everyone. Once the backend has auth, show them by role.
- For production, run `npm run build` and serve `dist/`, and either enable CORS on the gateway or serve the app from the same origin.
