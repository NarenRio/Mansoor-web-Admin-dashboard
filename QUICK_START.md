# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies (Already Done!)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at: **http://localhost:5173**

### 3. Make Sure Backend is Running
The frontend connects to: **http://localhost:3000**

Start the backend server:
```bash
cd ../backend
npm start
```

---

## 📝 How to Use

### Step 1: Enter Case ID
- Enter a case ID (e.g., `1`)
- The system will auto-load case information

### Step 2: Select Template
- Choose a petition template from the dropdown

### Step 3: Fill Petition Form
- **Subject**: Enter petition subject
- **Prayer**: Enter prayer text
- **Date**: Select petition date
- **Lawyer Name**: Enter lawyer name (optional)

### Step 4: Add Signature

**Option A: Draw Signature**
1. Click "Draw Signature" button
2. Draw your signature using mouse/touchpad
3. Click "Clear" to redraw if needed

**Option B: Upload Signature**
1. Click "Upload Signature" button
2. Click the upload area or drag & drop
3. Select your signature image file (PNG, JPG, max 200KB)

### Step 5: Create Petition
- Click "Create Petition & Generate PDF"
- Wait for processing (may take 10-30 seconds)
- PDF will be generated automatically

### Step 6: Download PDF
- After creation, click "Download PDF" link
- PDF will download to your computer

---

## 🎨 Features

✅ **Modern UI** - Clean, responsive design
✅ **Signature Drawing** - Draw signatures directly in browser
✅ **File Upload** - Upload existing signature images
✅ **Auto-fill** - Automatically loads case data
✅ **Template Selection** - Choose from available templates
✅ **PDF Generation** - Automatic OCR-readable PDF creation
✅ **Error Handling** - Clear error messages
✅ **Success Feedback** - Confirmation with download link

---

## 🛠️ Troubleshooting

### "Failed to fetch templates"
- Make sure backend server is running on port 3000
- Check backend URL in `src/services/api.js`

### "Failed to create petition"
- Check all required fields are filled
- Ensure signature is provided (drawn or uploaded)
- Verify case ID exists in database

### Signature not working
- For drawing: Use mouse or touchpad
- For upload: Check file is PNG/JPG and under 200KB

### PDF not generating
- Wait 10-30 seconds (first time takes longer)
- Check backend logs for errors
- Try generating PDF manually via API

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PetitionForm.jsx    # Main form
│   │   ├── SignaturePad.jsx     # Drawing component
│   │   └── FileUpload.jsx      # Upload component
│   ├── services/
│   │   └── api.js              # API calls
│   ├── App.jsx                 # Root component
│   └── main.jsx                # Entry point
├── package.json
└── vite.config.js
```

---

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 API Integration

The frontend uses these endpoints:

- `GET /api/petitions/templates/all` - Get templates
- `GET /api/petitions/case/:caseId/data` - Get case data
- `POST /api/petitions` - Create petition
- `GET /api/petitions/:id/download` - Download PDF

All endpoints are configured in `src/services/api.js`

---

## ✅ Ready to Use!

1. Start backend: `cd ../backend && npm start`
2. Start frontend: `npm run dev`
3. Open browser: http://localhost:5173
4. Create your first petition!

🎉 **Happy coding!**

