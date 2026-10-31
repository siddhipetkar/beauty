# Lumière Beauty — Smart Shade Shopping
> **Engineering Mini-Project in Java**  
> Complete Full-Stack Web Application with Pure Java Backend & Responsive React Frontend

---

## 🌟 Overview
**Lumière Beauty** is a luxury cosmetic and shade-matching e-commerce platform that treats colour as data. Built with a robust Java backend and an interactive front-end, it offers an end-to-end shopping experience tailored for beauty consumers.

### ✨ Key Features
- **44 Products & 209 Shades:** Comprehensive cosmetic catalog across Lips, Face, and Eyes categories.
- **Smart Swatch Wall & Shade Finder:** Real-time skin undertone/depth matching and side-by-side shade comparisons.
- **Dupe Finder:** Intelligent algorithm matching high-end shades to budget-friendly alternatives based on hex values and undertones.
- **Cart & Dynamic Pricing:** Real-time quote engine calculating Indian GST (18%), delivery fees, loyalty discounts, and coupons (`WELCOME10`, `LUMIERE20`, `BEAUTY50`).
- **Simulated Indian Checkout:** Cash on Delivery (COD), UPI (GPay/PhonePe), and Cards with order placement.
- **Order Tracking:** Live visual stage-by-stage shipping tracking timeline.
- **User Authentication & Profiles:** Login, registration, loyalty rewards points, and address management.
- **Admin Dashboard:** Real-time business metrics (revenue, order counts, customer insights, coupon management).

---

## 🛠️ Bugs Fixed & Emergent Branding Removed
1. **Removed All Emergent Watermarks & Wrappers:**
   - Tab title restored from `Loading...` / Emergent branding to:  
     `<title>Lumière Beauty | Smart Shade Shopping</title>`.
   - Replaced preview favicon with custom luxury SVG favicon.
   - Removed injected Emergent error overlay, recorder, and `postMessage` listeners.
2. **Fixed Browser Address/Search Bar Content:**
   - Removed preview host dependencies (`*.preview.emergentagent.com`).
   - All API endpoints now run on clean relative paths (`/api/*`), enabling independent local and production hosting.
3. **Fixed Mojibake Character Encoding Errors:**
   - Restored French accents (`LumiÃ¨re` ➔ `Lumière`).
   - Restored Indian Rupee currency symbols (`â‚¹` / `\uFFFD,1` ➔ `₹`).
   - Restored typographic em-dashes (`â€”` ➔ `—`) and ellipses (`â€¦` ➔ `...`).
4. **Added Pure Java Backend:**
   - Built `LumiereServer.java` using JDK 21 virtual threads, providing 37 REST API endpoints and Single-Page Application (SPA) routing with zero external dependencies required.

---

## 🚀 How to Run Locally (Localhost)

### Option 1: One-Click Runner (Windows)
Double-click `run.bat` in this folder. It will compile and start the Java server and automatically launch your browser at:
```
http://localhost:8080
```

### Option 2: Command Line (Java 21)
Open PowerShell or Command Prompt in the project folder:
```powershell
java LumiereServer.java
```
Then open your browser to [http://localhost:8080](http://localhost:8080).

---

## 🌐 How to Deploy from Localhost to a Live Website

You can deploy this application online for free in under 5 minutes without any Emergent branding:

### Method 1: Free Deployment on Render (Recommended)
1. Initialize a git repository and commit your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Lumiere Beauty project"
   ```
2. Push your project to a new repository on your GitHub account ([github.com](https://github.com)).
3. Go to [render.com](https://render.com) and sign up for free.
4. Click **New +** ➔ **Web Service** ➔ Connect your GitHub repository.
5. Select **Docker** as the Environment (the included `Dockerfile` will be auto-detected).
6. Click **Deploy Web Service**.
7. In ~2 minutes, your website will be live at a public URL like:
   ```
   https://lumiere-beauty.onrender.com
   ```

### Method 2: Free Deployment on Railway / Koyeb
- Push to GitHub.
- Select the repo on [railway.app](https://railway.app) or [koyeb.com](https://koyeb.com).
- Railway/Koyeb builds the `Dockerfile` automatically and assigns a clean custom domain or sub-domain.

---

## 📁 Project Directory Structure
```
lumiere-beauty/
├── LumiereServer.java          # Pure Java 21 Web Server & 37 REST API endpoints
├── run.bat                     # Windows 1-click launcher
├── run.ps1                     # PowerShell runner
├── pom.xml                     # Maven configuration for Java mini-project
├── Dockerfile                  # Container definition for cloud deployment
├── .gitignore                  # Git ignore rules
├── data/                       # Seed databases (JSON)
│   ├── categories.json         # Product categories
│   ├── products.json           # 44 luxury products
│   ├── shades.json             # 209 beauty shades with hex codes
│   ├── shade-families.json     # Shade colour groups
│   └── config.json             # Taxes, shipping & loyalty config
├── static/                     # Production-ready web assets
│   ├── index.html              # Clean HTML entry point (Zero Emergent scripts)
│   ├── favicon.svg             # Luxury Lumière SVG brand icon
│   └── static/js/bundle.js     # Clean compiled SPA application
└── frontend/                   # Source React components (for code inspection)
    ├── package.json
    ├── public/
    └── src/
        ├── App.js
        ├── components/
        ├── pages/
        ├── context/
        └── lib/
```
