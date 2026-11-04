# TODO

- [x] **Interactive ambulance response dashboard**
  - Create a responsive and interactive website for ambulance tracking and response planning.
  - Show an interactive dashboard with the current response situation, sample metrics, active response unit and route status.
  - Use sample data rather than real data for the project presentation.

- [x] **Automatic emergency alarms**
  - Give automatic alarms in case of heavy rain and traffic or a fallen tree.
  - Provide visible alarm severity, location, time, response implication, and acknowledge/dismiss interactions.

- [x] **Nearby hospital list**
  - List nearby hospitals with sample distance, capacity/availability and estimated ambulance handoff information.
  - Make hospital actions usable in the demo presentation.

- [x] **Ambulance route tracking and demo**
  - Track the route of an ambulance using a visible route line, moving unit marker, checkpoints, ETA and response status.
  - Provide a demo control to advance the simulated route and rehearse response planning.

- [x] **Final-year-project usability layer**
  - Add a guided A.C.T. response loop (Assess, Coordinate, Transfer) so a presenter can explain the workflow to a reviewer.
  - Add accessible skip navigation, live update regions, clearer simulated-data labeling, an explanation control for the route recommendation, and reduced-motion support.
  - Preserve responsive behavior across desktop and mobile presentation layouts.

- [x] **Emergency escalation and handoff details**
  - Add a presenter-activated alarm sound cue using the browser audio API, with a clear sound on/off control.
  - Show an alternate emergency route on the map and allow the presenter to show/hide or apply it.
  - Show sample ambulance driver contact details and sample hospital contact actions.
  - Show the final hospital destination with an explicit “Reached” state when the simulated route is completed, including a one-click demo arrival control.

- [x] **Functional live simulation**
  - Add a Run live control that automatically advances the ambulance, recalculates ETA and updates route progress until handoff.
  - Keep the simulation pausable and retain manual Advance scenario control for presenter-led demonstrations.

- [x] **Effective route decision support**
  - Compare North Ring Road and River Loop using sample travel time, obstruction risk and savings.
  - Allow the operator to select a route, visually emphasize the active map path, and recalculate the ambulance ETA for that route.
  - Keep the recommended alternate route explainable and connected to the Apply to demo route action.

- [x] **Alternate-route presentation scenario**
  - Provide a demo scenario where heavy rain reduces visibility and a fallen tree blocks North Ring Road.
  - Provide a Use this scenario action that reopens the relevant alarms, selects River Loop, updates the simulated rain/traffic values, and explains the diversion decision.
  - Move the simulated ambulance along a dedicated River Loop coordinate path after the alternate route is selected.

- [x] **Hospital receiving capacity**
  - Show sample available beds and doctors for each nearby hospital alongside travel time, capacity, readiness and contact details.
  - Include receiving capacity in the route-planning explanation for Central Medical.

- [x] **Expandable hospital details**
  - Keep each hospital row compact by default and reveal contact number, call action, available beds, available doctors, capacity and receiving status from the plus button beside the hospital name.

- [x] **Expandable final destination details**
  - Add a plus/minus control to the final destination card that reveals Central Medical contact, available beds, available doctors, capacity and receiving status.

- [x] **Fast operator access and profile**
  - Add a starting access screen with simulated Sign in and Create demo operator account paths.
  - Add a prominent Skip to emergency dashboard path so an operator can enter immediately without an account.
  - Make the coordinator profile button functional with editable display name/role, save behavior and sign-out back to the access screen.
