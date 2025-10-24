# PennyPilot Development Helper Scripts

Write-Host "🛠️  PennyPilot Dev Tools" -ForegroundColor Cyan
Write-Host "=====================`n" -ForegroundColor Cyan

function Show-Menu {
    Write-Host "Select an option:" -ForegroundColor Yellow
    Write-Host "1. Start development server" -ForegroundColor White
    Write-Host "2. Clear cache and restart" -ForegroundColor White
    Write-Host "3. Run TypeScript checks" -ForegroundColor White
    Write-Host "4. Generate GitHub issues from roadmap" -ForegroundColor White
    Write-Host "5. Create new feature branch" -ForegroundColor White
    Write-Host "6. Stop all Expo processes" -ForegroundColor White
    Write-Host "7. Update dependencies" -ForegroundColor White
    Write-Host "8. Exit`n" -ForegroundColor White
}

function Start-DevServer {
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
    npx expo start --clear
}

function Test-TypeScript {
    Write-Host "`n🔍 Running TypeScript checks..." -ForegroundColor Cyan
    npx tsc --noEmit
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No TypeScript errors found" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript errors found" -ForegroundColor Red
    }
}

function New-FeatureBranch {
    Write-Host "`n📝 Create new feature branch" -ForegroundColor Cyan
    $issueNumber = Read-Host "Issue number"
    $description = Read-Host "Short description (kebab-case)"
    $branchName = "feature/$issueNumber-$description"
    
    git checkout -b $branchName
    Write-Host "✅ Created and switched to branch: $branchName" -ForegroundColor Green
}

function Stop-ExpoProcesses {
    Write-Host "`n🛑 Stopping all Node/Expo processes..." -ForegroundColor Cyan
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*expo*"} | Stop-Process -Force
    Write-Host "✅ All processes stopped" -ForegroundColor Green
}

function Update-Dependencies {
    Write-Host "`n📦 Updating dependencies..." -ForegroundColor Cyan
    npm update
    Write-Host "✅ Dependencies updated" -ForegroundColor Green
}

function Invoke-IssueGenerator {
    Write-Host "`n📋 Generating GitHub issues..." -ForegroundColor Cyan
    
    # Check if GitHub CLI is installed
    try {
        gh --version | Out-Null
    } catch {
        Write-Host "❌ GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Red
        return
    }
    
    # Check if authenticated
    $authStatus = gh auth status 2>&1
    if ($authStatus -like "*not logged in*") {
        Write-Host "❌ Not authenticated. Run: gh auth login" -ForegroundColor Red
        return
    }
    
    node scripts/generate-issues.js
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter choice (1-8)"
    
    switch ($choice) {
        "1" { Start-DevServer }
        "2" { Start-DevServer }
        "3" { Test-TypeScript }
        "4" { Invoke-IssueGenerator }
        "5" { New-FeatureBranch }
        "6" { Stop-ExpoProcesses }
        "7" { Update-Dependencies }
        "8" { 
            Write-Host "`nGoodbye! 👋`n" -ForegroundColor Cyan
            break 
        }
        default { 
            Write-Host "`n❌ Invalid choice. Please select 1-8`n" -ForegroundColor Red 
        }
    }
    
    if ($choice -ne "8" -and $choice -ne "1" -and $choice -ne "2") {
        Write-Host "`nPress Enter to continue..." -ForegroundColor Gray
        Read-Host
    }
    
} while ($choice -ne "8")
