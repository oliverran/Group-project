# Offline booking lab

A small, independent interactive tutorial for the booking-timeline idea in this repository. It deliberately does not load or modify the historical application, its vendor libraries, account database, or Airtable integration. It does not reproduce the full original product.

## Start in seconds

Open `index.html` from this folder in a current browser. No installation, server, login, API key, or internet connection is required. Keep `app.js`, `model.js`, and `style.css` beside it.

If your browser blocks local JavaScript files, serve **only this example folder**, not the repository root:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory Coding/offline-gantt
```

Then open `http://127.0.0.1:8000`. Stop the server with Ctrl+C.

## Five-minute walkthrough

1. Select **DEMO-01**. Its bar begins at the window edge, but the inspector shows the full May 30–June 5 booking.
2. Choose **Next lesson**. The window expands from 14 to 28 days, revealing DEMO-05. Try the resource filter and Earlier/Later controls.
3. Choose **Next lesson** again. The overlap scenario adds DEMO-06 to the Cloud sculpture lane. Three reservations are marked as conflicts. DEMO-01 and DEMO-02 touch but do not conflict with each other.
4. Choose **No bookings** to explore the empty state. **Reset demo** returns every control and lesson to the starting point. Lessons intentionally load their own scenario so the instructions stay reproducible.
5. Open the accessible table and select a booking there. Native controls and booking buttons work with the keyboard. A narrow screen scrolls the timeline horizontally without overflowing the page.

## Read the code

- `model.js`: invented fixtures, strict UTC calendar dates, half-open intervals, clipping, and same-resource conflict detection. This is the only data source.
- `app.js`: view state, three guided lessons, safe text rendering, filters, navigation, inspection, and reset. No data is saved or transmitted.
- `style.css`: responsive layout, scrollable timeline, visible keyboard focus, and text-labelled conflicts.
- `model.test.js`: dependency-free Node.js tests for date boundaries, overlap rules, clipping, empty states, and offline assets.
- `browser_check.py`: optional browser regression tests for interactions and the no-network guarantee.

End dates are **exclusive**: `[2026-06-01, 2026-06-05)` occupies June 1–4. A booking may start on the previous booking's end date. Dates are UTC calendar days, so daylight-saving changes do not alter bar widths. A bar is clipped to the view, while the inspector/table always show full dates. The conflict count is the number of visible bookings that overlap another booking on their resource, not the number of overlapping pairs.

## Run checks

From the repository root, with Node.js 22 or later:

```sh
node --test Coding/offline-gantt/model.test.js
```

Optional browser checks require Python 3.10+ and a test-only Playwright installation:

```sh
python3 -m venv .venv-gantt
. .venv-gantt/bin/activate
python -m pip install playwright==1.58.0
python -m playwright install chromium
python Coding/offline-gantt/browser_check.py
```

On Windows, activate the environment with `.venv-gantt\Scripts\activate` instead. In Linux CI, Playwright may need `install --with-deps chromium`. If Chromium is already installed, set `CHROMIUM_EXECUTABLE` to its executable path to skip downloading a test browser. The example itself has no package dependencies. The scoped GitHub Actions workflow runs the model and browser checks; it does not exercise the legacy application.

## Boundaries and provenance

All DEMO IDs, resources, and booking dates are newly invented teaching data. There are no customer records, personal names, real account logins, storage, booking writes, imports, or network calls. The page also blocks network connections with a Content Security Policy. Never add live credentials or customer data to this example.

This example is newly written and isolated. Existing third-party code, attribution, and license notices elsewhere in the repository remain unchanged; this addition does not relicense the historical project. It is not a production scheduler: it has no availability guarantee, persistence, authentication, synchronization, capacity planning, or infinite time axis. It targets current browsers rather than the legacy project's old-browser requirements.
