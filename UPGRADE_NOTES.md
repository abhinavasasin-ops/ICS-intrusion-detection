# UI Upgrade Notes

## What changed

### Operations dashboard
- Reworked the dashboard into a responsive security operations centre with a dedicated status overview, metrics, recent detections, and detection distribution.
- Added a live attack-probability chart based on recent predictions returned by the backend.
- Added service readiness indicators using the existing health and model-info APIs.
- Added quick navigation to the live monitor and alarm centre.
- Added automatic dashboard refresh every 15 seconds and a manual refresh action.
- Empty states guide the user toward uploading a dataset or starting the simulator.

### Navigation and visual design
- Replaced the plain sidebar with a responsive, grouped navigation layout.
- Added a mobile navigation drawer, user identity panel, role display, and more consistent visual hierarchy.
- Applied a dark industrial-security palette with clearer status, severity, and interaction states.

### Analytics
- Added CSV export for up to 200 recent prediction records.
- Removed hard-coded model performance values from the analytics page. Metrics now come from the backend's model-info response when available.
- Added a note clarifying that validation metrics are not live accuracy measurements.

## Important interpretation notes
- Dashboard metrics are fetched from the authenticated backend and are not fabricated demo values.
- The detection trend visualises the Random Forest probability returned by the API; it does not claim to be packet-level live network traffic.
- Backend health does not independently prove that the database is healthy. The dashboard therefore labels this as API/data-layer health rather than a verified database check.
- Model evaluation numbers are configuration-provided validation metrics. They should not be presented as performance on the currently uploaded CSV.

## Run locally

Use the project's existing setup instructions in `README.md`. In general:
1. Configure `backend/.env` using `backend/.env.example`.
2. Start the FastAPI backend with the dependencies in `backend/requirements.txt`.
3. In `frontend`, run `npm install` and then `npm run dev`.
4. Open the Vite URL printed in the terminal.

The bundled `node_modules` and `dist` folders are intentionally excluded. Install dependencies locally and rebuild the frontend in your environment.
