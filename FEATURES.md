# Features

## Purpose
- This repository is a **client-facing web demo** for a driver-only logistics MVP.
- The artifact sells the UX and workflow of a future mobile app without implementing real backend, camera, or push integrations.

## Demo Flow
- Driver lands on a simple sign-in sequence: email screen, password screen, and forgot password screen.
- After sign-in, the driver sees assigned loads only.
- A load opens into a compact detail view with route, trip status, and BOL/POD checklist.
- Driver marks the load as delivered through a confirmation sheet.
- Driver uploads document types through a simplified capture flow and must manually attach each required document before submission.
- Notifications can be opened after sign-in to show assignment, re-upload, and sync messages.
- Settings is reduced to a single update-password action that opens a dedicated password update screen.

## Scenarios Included
- `happyPath`: assigned load -> delivered -> documents uploaded successfully.
- `reuploadRequired`: rejected BOL triggers a clean re-upload loop.
- `offlinePending`: upload queues locally while signal is weak, then syncs later.
- `uploadError`: first submission fails, retry succeeds without leaving the workflow.
- `noLoads`: empty state for drivers between assignments.

## Intentional Non-Goals
- No live REST API integration.
- No native React Native shell or Expo project in this repo.
- No real camera, filesystem, or push notification plumbing.
- No dispatcher, admin, or broker-facing workflows.
