# RainWatch Emergency Response Dashboard — Plan

## Scope
A presentation-ready responsive web demo for ambulance tracking and emergency response planning using simulated sample data only. The core experience is a command-center dashboard that surfaces weather, traffic, fallen-tree and ambulance incidents; lets a presenter acknowledge/dismiss alarms; lists nearby hospitals; and shows an animated ambulance route with ETA and response status.

## Design options
- **0.07 — Night-shift command center:** dark observatory interface with luminous status colors and map-like route traces.
- **0.05 — Floodline operations board:** pale industrial board with bold orange warnings and documentary labels.
- **0.03 — Civic response atlas:** warm paper-like interface with cartographic panels and municipal typography.

### Chosen direction: Night-shift command center
- **Design Movement:** mission-control UI meets contemporary civic-tech dashboard.
- **Core Principles:** immediate readability, calm hierarchy under pressure, transparent sample-data labeling, and fast presenter interactions.
- **Color Philosophy:** deep navy and graphite create focus; teal signals safe flow; amber and coral reserve attention for operational risk.
- **Layout Paradigm:** a left command rail anchors context while the main canvas stacks the live situation, route map, alarms and hospitals as a flowing operational wall rather than a generic centered card grid.
- **Signature Elements:** radar-like pulse rings, thin route lines with moving markers, and compact uppercase operational labels.
- **Interaction Philosophy:** every interactive control changes the situation board visibly—alarms can be acknowledged, filters can focus the response view, and the route can be advanced for demo storytelling.
- **Animation:** restrained 2–6 second pulses for live markers, smooth route progression, and short panel transitions; no distracting perpetual motion.
- **Typography System:** Inter for interface text with Space Grotesk for metric numerals and section titles; uppercase micro-labels use increased tracking.
- **Brand Essence:** A clear, simulated command surface for coordinating ambulance response when conditions change; focused, prepared, reassuring.
- **Brand Voice:** concise and operational. Example lines: “Route risk is rising.” “Advance the scenario to rehearse the handoff.”
- **Wordmark & Logo:** a four-point locator mark enclosing a small pulse line, paired with the RainWatch wordmark.
- **Signature Brand Color:** electric teal `#24D6C5`.

## Implementation
- Plain HTML/CSS/JavaScript served by a tiny Node HTTP server on port 3000.
- Local state contains sample incidents, hospitals, an ambulance route, ETA, and alarm status; no external APIs or database.
- Responsive layout collapses the rail and map/dashboard columns for tablet and mobile widths.
- `/manus-routes.json` declares the single `/` page.
- Demo controls: scenario selector, pause/resume simulation, acknowledge alarms, advance route, focus buttons, and hospital “Call” feedback.
- Final-year-project layer: a guided A.C.T. (Assess, Coordinate, Transfer) response loop, explainable recommendation feedback, accessible skip navigation/live regions, clearer onboarding copy, and reduced-motion support.
- Emergency escalation layer: presenter-activated browser audio cue, alternate route overlay and control, sample ambulance driver/hospital contacts, and an explicit final destination panel that changes from En Route to Reached.
- Functional simulation: Run live automatically advances the route on a timer while manual advancement, pause/resume, arrival completion, and sample contact actions remain available for presenter control.
- Routing decision support: compare North Ring Road and River Loop, show time/risk trade-offs, select the active route, emphasize it on the map, and recalculate ETA accordingly.
- Presentation scenario: simulate heavy rain plus a fallen tree blocking North Ring Road, then use one action to reopen alarms, apply River Loop, and explain the safer diversion.
- Alternate-route movement: use a dedicated simulated River Loop coordinate path so live/manual advances visibly follow the selected diversion.
- Hospital handoff capacity: show simulated available beds and doctors for nearby hospitals and reference receiving capacity in the recommended destination explanation.
- Hospital interaction: keep the network compact with plus-button accordions that reveal contact, beds, doctors, capacity and readiness details on demand.
- Destination interaction: give the final Central Medical handoff card the same plus/minus accordion pattern for receiving details.
- Access flow: provide simulated sign-in/create-account screens, a rapid emergency bypass, local demo access persistence, and an editable coordinator profile with sign-out.

## Project structure
- `index.html`: app shell and semantic sections.
- `styles.css`: visual system, responsive layout, map illustration and motion.
- `app.js`: sample data, rendering, event handlers, simulated live updates.
- `server.mjs`: static file server for preview.
- `public/manus-routes.json`: route manifest.
- `TODO.md`: outcome tracking.
