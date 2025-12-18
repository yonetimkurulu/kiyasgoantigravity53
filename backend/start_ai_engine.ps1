Write-Host "🚀 KıyasGO AI Motoru Başlatılıyor..." -ForegroundColor Green

# 1. Check for .env
if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Write-Host "⚠️ .env dosyası bulunamadı. env.example kopyalanıyor..." -ForegroundColor Yellow
        Copy-Item "env.example" -Destination ".env"
        Write-Host "❗ LÜTFEN .env DOSYASINI AÇIP API ANAHTARLARINI GİRİN!" -ForegroundColor Red
        # Pause to let user edit if they run interactively, or continue to fail? 
        # Better to warn and try to run.
    } else {
        Write-Error "❌ Ne .env ne de env.example bulundu!"
        exit 1
    }
}

# 2. Virtual Environment
if (-not (Test-Path "venv")) {
    Write-Host "📦 Sanal ortam (venv) oluşturuluyor..." -ForegroundColor Cyan
    python -m venv venv
}

# 3. Activate & Install
Write-Host "🔌 Sistem yükleniyor..." -ForegroundColor Cyan
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 4. Run Server
Write-Host "🧠 AI Motoru Ateşleniyor (Port: 8000)..." -ForegroundColor Green
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
