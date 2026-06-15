# UrbanLens AI — AI Powered Informal Settlement Infrastructure Mapper

UrbanLens AI is a geospatial AI platform designed to help governments, NGOs, and urban planners identify infrastructure gaps in informal settlements (slums). The platform parses satellite and drone imagery, maps critical facilities, calculates spatial access gaps, predicts future socio-environmental risks, and recommends optimized locations for new clinics, schools, and water infrastructure.

---

## 🌟 Key Features

1. **Animated Interactive GIS Map**: Fullscreen Leaflet map loading informal settlement grids, unpaved pathways, drainage pipelines, water kiosks, schools, and street lights. Supports manual polygon drawing with automatic area metrics.
2. **YOLOv8 Satellite Detection**: Drag-and-drop satellite image upload module with computer vision segmentation that highlights buildings, roads, and open sewers.
3. **Infrastructure Gap Auditing**: Accessibility heatmaps mapping distance deficits to healthcare, clean water, and street lighting.
4. **Predictive Risk Analytics**: Demographic growth curves and flood/water crisis risk forecasting modeled using Scikit-Learn.
5. **Geo-Location Optimizer**: Spatial recommendation pins suggesting optimized layouts for new water tanks and clinics, complete with rationale panels.
6. **Citizen Reporting & Media Capture**: Mobile-ready citizen reporting form simulating location tracking, photo capture, and audio recording.
7. **Government Moderation Console**: Moderation dashboard for authorities to review issues, moderate citizen reports, and approve AI recommendations.

---

## 🛠️ Technology Stack

* **Frontend**: React.js, Tailwind CSS, Leaflet.js, Framer Motion, Chart.js, React Router
* **Backend**: FastAPI (Python), Uvicorn
* **Database**: MongoDB (with automatic JSON file storage fallback)
* **AI/ML & Geospatial**: OpenCV, Scikit-Learn, GeoJSON, standard-compliant PDF generators

---

## 📂 Project Structure

```
ai/
├── requirements.txt           # Python backend dependencies
├── package.json               # Frontend dependencies & dev script
├── tailwind.config.js         # Tailwind theme & color configurations
├── index.html                 # App root html document
├── main.py                    # Root FastAPI loader for uvicorn
├── app/                       # FastAPI Backend
│   ├── main.py                # Router registration & CORS setup
│   ├── database.py            # Unified DB interface with JSON file fallback
│   ├── auth.py                # Pure-python custom standard-compliant JWT & Hash logic
│   ├── ai.py                  # Computer Vision & Regression predictive models
│   ├── mock_data.py           # Preloaded Kibera GIS data, reports, and shapes
│   └── routes/                # Endpoint routers (auth, stats, analysis, gaps, etc.)
└── src/                       # React Frontend
    ├── main.jsx               # React entry script
    ├── App.jsx                # Theme and Router config
    ├── index.css              # Custom scrollbars, animations, and glassmorphic css
    ├── components/            # Reusable elements (Sidebar, Navbar, Map, Metrics)
    └── pages/                 # Full view layouts (Landing, Login, Dashboard, Analysis, Gaps, etc.)
```

---

## 🚀 Local Installation & Run Guide

The application is architected to run out of the box with zero compilation or setup errors, using local fallback databases and AI simulation layers if MongoDB or native C++ ML wrappers are missing.

### 1. Backend API Server Setup
Make sure you have Python 3.8+ installed. Open a terminal in the project root:

```bash
# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (running on http://127.0.0.1:8000)
uvicorn main:app --reload
```

*Note: If no local MongoDB is running, the server will output a warning and automatically read/write to a local `db_fallback.json` file. All operations remain fully functional!*

### 2. Frontend React Client Setup
Open a second terminal in the project root:

```bash
# Install node packages
npm install

# Start the Vite development server (typically running on http://localhost:5173)
npm run dev
```

---

## 🔑 Evaluation Accounts

You can log in to test role-specific functionalities using the **Single-Click quick fill buttons** on the Login screen, or enter these credentials manually:

| Account Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Moderate reports, delete users, full system configs |
| **Government Authority** | `government` | `govt123` | Approve AI recommendations, moderate citizen issues |
| **NGO Analyst** | `ngo` | `ngo123` | Run gap analysis, export GeoJSON and PDF maps |
| **Citizen Observer** | `citizen` | `citizen123` | Submit field geotags, capture photo/voice issues |

---

## ☁️ Cloud Deployment Guidelines

### 1. Database (MongoDB Atlas)
1. Provision a free cluster on MongoDB Atlas.
2. Under Network Access, allow access from the server's IP address.
3. Copy the connection string. Set the environment variable `MONGODB_URI` on your host server (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/urbanlens`).

### 2. Backend (AWS EC2 / Elastic Beanstalk)
1. Launch an Ubuntu EC2 instance. Configure Security Groups to expose port `80` (HTTP) and port `22` (SSH).
2. Clone the repository and install system dependencies: `sudo apt update && sudo apt install python3-pip python3-venv git`.
3. Create a python virtual environment, activate it, and run `pip install -r requirements.txt`.
4. Deploy the FastAPI app behind a reverse proxy like **Nginx** and manage the uvicorn process using **Systemd** or **Supervisor**.

### 3. Static Frontend (AWS S3 & CloudFront / Vercel)
1. Run `npm run build` in the project root to generate the optimized output bundle in the `/dist` folder.
2. Upload the contents of `/dist` to an AWS S3 bucket configured for Static Website Hosting.
3. Connect a CloudFront CDN distribution to the S3 bucket to enforce SSL/HTTPS.
