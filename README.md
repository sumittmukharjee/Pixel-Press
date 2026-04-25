# PixelPress — Image Resizer

A fast, private, browser-based image resizer. No uploads. Everything runs on your device.

---

## 🚀 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# → Opens at http://localhost:5173

# 3. Build for production
npm run build
# → Output in /dist folder
```

---

## ☁️ Deploy Free — 3 Options

---

### Option 1: Vercel (Recommended — Easiest, ~2 min)

1. Push your project to a GitHub repo
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pixelpress.git
   git push -u origin main
   ```

2. Go to **https://vercel.com** → Sign up with GitHub

3. Click **"Add New Project"** → Import your GitHub repo

4. Settings (auto-detected):
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Click **Deploy** → Done ✅

Your site is live at: `https://pixelpress-xyz.vercel.app`

> Custom domain: Free on Vercel. Add your own domain in Project → Settings → Domains.

---

### Option 2: Netlify (Drag & Drop — No GitHub needed)

1. Build locally first:
   ```bash
   npm run build
   ```

2. Go to **https://netlify.com** → Sign up (free)

3. Drag and drop the `/dist` folder onto the Netlify dashboard

4. Done ✅ — Live in seconds at `https://random-name.netlify.app`

> For auto-deploy on git push: Connect GitHub repo in Netlify → Site Settings

---

### Option 3: GitHub Pages (Free with GitHub account)

1. Install the deploy tool:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json` scripts:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/pixelpress",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Add to `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/pixelpress/',
     plugins: [react()],
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

5. Done ✅ — Live at `https://YOUR_USERNAME.github.io/pixelpress`

---

## 📁 Project Structure

```
pixelpress/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component
    ├── App.module.css
    ├── hooks/
    │   ├── useTheme.js       # Dark/light mode
    │   └── useImageProcessor.js  # Core resize logic
    ├── components/
    │   ├── Navbar.jsx/css
    │   ├── DropZone.jsx/css
    │   ├── Presets.jsx/css
    │   ├── Controls.jsx/css
    │   ├── PreviewPanel.jsx/css
    │   ├── OutputPanel.jsx/css
    │   ├── Toast.jsx/css
    │   └── Footer.jsx/css
    └── styles/
        └── index.css         # Global tokens & reset
```

---

## ✨ Features

- Drag & drop or click to upload
- Custom width × height with live preview
- Lock/unlock aspect ratio
- Quality slider (1–100%)
- Target KB/MB mode (auto binary search)
- Output: JPEG, PNG (lossless), WebP
- Presets: Passport, Aadhaar, PAN, Visa, FHD, etc.
- Dark / Light mode
- 100% private — no server, no upload, no tracking
