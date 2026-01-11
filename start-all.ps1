# ===============================
# START ALL SERVICES (PROD)
# ===============================

Write-Host "🚀 Starting Handwritten → DOC backend services..."

$ROOT = $PSScriptRoot
$EXPORT = Join-Path $ROOT "export_service"

# --- 1️⃣ Cloudflare Tunnel (FIRST) ---
Write-Host "🌐 Starting Cloudflare Tunnel..."
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command cloudflared tunnel run handwritten-docx"

Start-Sleep -Seconds 5

# --- 2️⃣ Flask DOCX Backend (8001) ---
Write-Host "📄 Starting Flask DOCX server (8001)..."
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command cd `"$EXPORT`"; .\venv\Scripts\Activate.ps1; python flask_docx.py"

Start-Sleep -Seconds 3

# --- 3️⃣ FastAPI OCR Backend (8000) ---
Write-Host "🧠 Starting FastAPI OCR server (8000)..."
Start-Process powershell -ArgumentList `
  "-NoExit", `
  "-Command cd `"$EXPORT`"; .\venv\Scripts\Activate.ps1; uvicorn app:app --host 0.0.0.0 --port 8000"

Write-Host "✅ All backend services started successfully"
