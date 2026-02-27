# Premium Lounge Face Recognition Setup - Frontend

This is the fully functioning React frontend for the Premium Lounge Face Recognition project. It operates out of Vite + React + Tailwind CSS.

## Features & Interfaces

- **Login Portal:** Admin authentication boundary managing JSON Web Tokens (JWT).
- **Dashboard UI:** Administrative view to see incoming face-recognition access logs in real-time.
- **Member Registration (Kiosk):** Interface to take an initial snapshot photo of a newly registered member and upload it to the FastAPI backend.
- **Live Verification Kiosk:** The core lounge accessibility gate. Continuously or manually snaps webcam frames and pushes them to the `POST /verify` backend API to indicate "GRANTED" or "DENIED" on screen.

## Running Locally

1. Setup Node Modules
```bash
npm install
```

2. Start Development Server
```bash
npm run dev
```

Remember to verify your `.env` variables (e.g., `VITE_API_BASE_URL`) point to your running FastAPI backend server port (usually `localhost:8000`).

*(See the main project README at the root directory for a comprehensive data-flow diagram and full backend setup instructions.)*
