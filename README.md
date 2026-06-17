# BigQuery Release Notes App

A modern, visually striking web application built with Python Flask, HTML, CSS, and vanilla JavaScript. It dynamically fetches and displays the latest release notes from the official [Google Cloud BigQuery XML feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml).

## ✨ Features

* **Live Data:** Fetches directly from the Google Cloud Atom feed via a Flask proxy (to bypass CORS restrictions).
* **Modern UI/UX:** Features a dark glassmorphism design with animated background elements, smooth hover states, and dynamic rendering.
* **Smart Filtering:** Automatically extracts tags (e.g., Feature, Announcement, Deprecation) and creates interactive filter chips.
* **Skeleton Loading:** Displays shimmer placeholder cards while the data is being fetched.
* **Tweet Integration:** Includes a built-in modal that lets you instantly compose and share a specific release note to X (Twitter).
* **Responsive:** Designed to look great on desktop and mobile screens.

## 🛠️ Technology Stack

* **Backend:** Python, Flask, `xml.etree.ElementTree`
* **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)

## 🚀 Getting Started

### Prerequisites
* Python 3.x installed
* `pip` (Python package installer)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayebiatsin/ayebi-event-talks-app.git
   cd ayebi-event-talks-app
   ```

2. **(Optional) Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install flask
   ```

4. **Run the Flask application:**
   ```bash
   python app.py
   ```

5. **Open in your browser:**
   Navigate to `http://127.0.0.1:5000` to view the app.

## 📂 Project Structure

```text
├── app.py                  # Flask backend server and XML feed parser
├── templates/
│   └── index.html          # Main HTML structure, layout, and Tweet modal
├── static/
│   ├── style.css           # Styling, animations, and responsive design
│   └── script.js           # Frontend logic (fetching, filtering, rendering)
└── .gitignore              # Ignored files (pycache, envs, etc.)
```
