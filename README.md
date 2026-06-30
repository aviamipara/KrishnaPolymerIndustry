# Krishna Polymer Industry Website - Full Stack Flask App

This is a full-stack website for **Krishna Polymer Industry**, built with a **Python Flask** backend and a **SQLite** database for storing quote requests. It features a modern, responsive frontend and a secure **Admin Submissions Portal** to view and search incoming Request for Quotes (RFQs).

---

## Folder Structure

```
krishna-polymer-industry/
├── app.py                 # Flask server (routes, API, and DB connection)
├── database.db            # SQLite database containing submissions (auto-created)
├── requirements.txt       # Python package dependencies
├── README.md              # Documentation guide
├── static/                # Static assets served by Flask
│   ├── css/
│   │   └── style.css      # Custom styling & animations
│   └── js/
│       └── main.js        # Form submissions AJAX and filtering
└── templates/             # HTML Templates rendered by Flask
    ├── index.html
    ├── about.html
    ├── products.html
    ├── capabilities.html
    ├── contact.html
    └── admin.html         # Admin dashboard login and tables
```

---

## Local Setup & Run

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.

### 2. Installation
Open your terminal inside the project directory and install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Running the Server
Start the Flask development server:
```bash
python app.py
```
The server will start on: **`http://127.0.0.1:5000`**

### 4. Admin Dashboard Access
- Visit: `http://127.0.0.1:5000/admin`
- Enter default password: **`admin123`**
- *Note: To override the password, set the `ADMIN_PASSWORD` environment variable before launching.*

---

## Deployment Guide

### Option 1: Render (Recommended & Free)
1. Commit all files to a **GitHub repository**.
2. Create a new account at [Render](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Set the following settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Add the following **Environment Variables** in Render:
   - `SECRET_KEY`: A random secure string.
   - `ADMIN_PASSWORD`: Your custom dashboard password.
7. Click **Deploy Web Service**.

### Option 2: Railway
1. Commit files to **GitHub**.
2. Connect GitHub to [Railway](https://railway.app/).
3. Create a new project, select **Deploy from GitHub repo**, and select this repository.
4. Railway will automatically detect Flask and deploy it.
5. In Railway settings, add Environment Variables for `SECRET_KEY` and `ADMIN_PASSWORD`.

### Option 3: Heroku
1. Install Heroku CLI on your system and log in.
2. Initialize git and run commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku create krishna-polymer-industry
   git push heroku master
   ```
3. Set config values:
   ```bash
   heroku config:set ADMIN_PASSWORD=yourpassword
   heroku config:set SECRET_KEY=yoursecretkey
   ```
