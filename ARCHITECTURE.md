# Architecture

## Stack
- `Vite + React + TypeScript` single-page demo application.
- `Vitest + React Testing Library` for reducer and smoke coverage.

## Structure
- `src/app`: outer scene, iPhone-style frame, presenter dock, app bootstrap.
- `src/demo`: typed fixtures, scenario definitions, reducer/state machine, in-phone screens.
- `src/styles`: theme tokens, device chrome, layout, component styling.

## State Model
- One central reducer owns the entire scripted demo.
- Scenario switching resets the app into a fresh state derived from typed blueprint fixtures.
- UI state includes screen, selected load, notification panel, settings view, delivery confirmation sheet, upload selection, offline flag, and queued/error upload markers.

## Rendering Strategy
- Desktop shows the demo inside an iPhone-style frame with a separate presenter dock.
- Mobile hides presentation chrome and lets the interface behave like a full-screen app surface.
- The in-phone UI is screen-driven rather than route-driven because this artifact is optimized for deterministic client demos.
- Upload selection starts empty on every upload screen entry so attach behavior is explicit in each scenario.

## Data Model
- Typed objects mirror likely future API concepts: loads, documents, notifications, and scenario identifiers.
- Fixtures stay close to realistic logistics data so the UI can later be adapted to a real REST layer with minimal reshaping.
