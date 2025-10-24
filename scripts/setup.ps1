# PennyPilot Setup Script for Windows
# Run with: .\scripts\setup.ps1

Write-Host "🚀 PennyPilot Development Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "`nChecking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Check Git
Write-Host "`nChecking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ $gitVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install from https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Check GitHub CLI
Write-Host "`nChecking GitHub CLI..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version
    Write-Host "✅ GitHub CLI found" -ForegroundColor Green
} catch {
    Write-Host "⚠️  GitHub CLI not found (optional for issue generation)" -ForegroundColor Yellow
    Write-Host "   Install from: https://cli.github.com/" -ForegroundColor Gray
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check for .env file
Write-Host "`n🔐 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env file found" -ForegroundColor Yellow
    Write-Host "   Create .env and add your OpenAI API key:" -ForegroundColor Gray
    Write-Host "   OPENAI_API_KEY=your_key_here" -ForegroundColor Gray
}

# Create necessary directories
Write-Host "`n📁 Creating project directories..." -ForegroundColor Yellow
$directories = @("src/components", "assets/images", "scripts")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    }
}

Write-Host "`n✨ Setup complete!`n" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add your OpenAI API key to .env file" -ForegroundColor White
Write-Host "2. Run 'npx expo start --clear' to start development" -ForegroundColor White
Write-Host "3. Check ROADMAP.md for development plan" -ForegroundColor White
Write-Host "4. Review CONTRIBUTING.md for contribution guidelines" -ForegroundColor White
Write-Host "5. (Optional) Run 'node scripts/generate-issues.js' to create GitHub issues`n" -ForegroundColor White

Write-Host "Happy coding! 🎉" -ForegroundColor Cyan
