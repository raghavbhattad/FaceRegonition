# Premium Lounge Face Recognition System

An AI-powered Premium Lounge access system built using React for the frontend and FastAPI for the backend. The system allows admins to securely register members, store facial embeddings in a MongoDB database (with an in-memory cache for fast retrieval), and perform real-time facial verification for lounge access under 3 seconds.

## System Architecture

**Frontend (React/Vite):**
- Captures webcam frames via the browser interface.
- Provides an Admin login portal.
- Includes a Dashboard for live logs and statistics.
- Sends multipart/form-data POST requests with captured images.

**Backend (FastAPI):**
- Processes image blobs via DeepFace/OpenCV to generate facial embeddings.
- Computes vectorized Cosine Similarity mathematics to find best matches.
- Persists entry logs and member data in MongoDB.
- Implements an optimized In-Memory embedding cache to prevent slow subsequent DB reads.
- Secured using JWT authentication (Bearer tokens).

## Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Axios/Fetch
- **Backend:** Python, FastAPI, DeepFace, OpenCV, PyMongo, Uvicorn, JWT
- **Database:** MongoDB

---

## Local Setup & Installation

### 1. Prerequisites
- Python 3.8+
- Node.js & npm
- MongoDB instance (local or Atlas)

### 2. Backend Setup
Navigate into the `backend` directory and install the necessary Python packages:

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder (based on the provided template or adding your own credentials):
```env
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
```

Run the backend server:
```bash
uvicorn main:app --reload
```
The FastAPI instance will be running on `http://localhost:8000`. API docs can be viewed at `http://localhost:8000/docs`.

### 3. Frontend Setup
Navigate into the `frontend` directory to install and run the React app:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder if needed:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```
The React frontend will be accessible at `http://localhost:5173`.

---

## API Endpoints Overview

- `POST /login`: Receives admin credentials, returns JWT.
- `POST /register`: Registers a new member along with their facial embedding. (Requires Auth)
- `POST /verify`: Real-time endpoint that checks an uploaded image against the in-memory cache for lounge access.
- `GET /logs`: Fetches a chronological list of member access validations. (Requires Auth)
