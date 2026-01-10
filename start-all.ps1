# ===============================
# START ALL SERVICES (PROD)
# ===============================

Write-Host "🚀 Starting Handwritten → DOC services..."

# --- FastAPI OCR backend ---
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command cd export_service; .\venv\Scripts\Activate.ps1; uvicorn app:app --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 5

# --- Flask DOCX backend ---
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command cd export_service; .\venv\Scripts\Activate.ps1; python flask_docx.py"

Start-Sleep -Seconds 3

# --- Cloudflare tunnel ---
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command cloudflared tunnel run handwritten-docx"

Start-Sleep -Seconds 3

# --- Next.js frontend ---
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command npm run dev"

Write-Host "✅ All services started"
