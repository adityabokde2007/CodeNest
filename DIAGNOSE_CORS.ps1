# CORS Diagnostic Script
# Run this in PowerShell to diagnose the issue

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   CodeNest CORS Diagnostic Tool" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
Write-Host "Checking project directory..." -ForegroundColor Yellow
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor White

if (Test-Path "cors.json") {
    Write-Host "✓ cors.json found" -ForegroundColor Green
} else {
    Write-Host "✗ cors.json NOT found - you need to be in the project directory!" -ForegroundColor Red
    Write-Host "Run: cd 'C:\Users\ADMIN\OneDrive\Desktop\codenest'" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Checking CORS on .appspot.com bucket..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

try {
    $appspotResult = gsutil cors get gs://codenest-63572.appspot.com 2>&1
    if ($appspotResult -match "BucketNotFoundException") {
        Write-Host "✗ Bucket codenest-63572.appspot.com does NOT exist" -ForegroundColor Red
    } elseif ($appspotResult -match "localhost:5173") {
        Write-Host "✓ CORS is SET on codenest-63572.appspot.com" -ForegroundColor Green
        Write-Host "   Contains localhost:5173 origin" -ForegroundColor Green
    } elseif ($appspotResult -eq "[]" -or $appspotResult.Length -eq 0) {
        Write-Host "✗ CORS is EMPTY on codenest-63572.appspot.com" -ForegroundColor Red
        Write-Host "   Run: gsutil cors set cors.json gs://codenest-63572.appspot.com" -ForegroundColor Yellow
    } else {
        Write-Host "⚠ CORS is set but doesn't include localhost:5173" -ForegroundColor Yellow
        Write-Host "   Run: gsutil cors set cors.json gs://codenest-63572.appspot.com" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error checking codenest-63572.appspot.com: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Checking CORS on .firebasestorage.app bucket..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

try {
    $storageResult = gsutil cors get gs://codenest-63572.firebasestorage.app 2>&1
    if ($storageResult -match "BucketNotFoundException") {
        Write-Host "✗ Bucket codenest-63572.firebasestorage.app does NOT exist" -ForegroundColor Red
    } elseif ($storageResult -match "localhost:5173") {
        Write-Host "✓ CORS is SET on codenest-63572.firebasestorage.app" -ForegroundColor Green
        Write-Host "   Contains localhost:5173 origin" -ForegroundColor Green
    } elseif ($storageResult -eq "[]" -or $storageResult.Length -eq 0) {
        Write-Host "✗ CORS is EMPTY on codenest-63572.firebasestorage.app" -ForegroundColor Red
        Write-Host "   Run: gsutil cors set cors.json gs://codenest-63572.firebasestorage.app" -ForegroundColor Yellow
    } else {
        Write-Host "⚠ CORS is set but doesn't include localhost:5173" -ForegroundColor Yellow
        Write-Host "   Run: gsutil cors set cors.json gs://codenest-63572.firebasestorage.app" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error checking codenest-63572.firebasestorage.app: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Apply CORS to BOTH buckets:" -ForegroundColor Yellow
Write-Host "   gsutil cors set cors.json gs://codenest-63572.appspot.com" -ForegroundColor White
Write-Host "   gsutil cors set cors.json gs://codenest-63572.firebasestorage.app" -ForegroundColor White

Write-Host ""
Write-Host "2. Clear browser cache:" -ForegroundColor Yellow
Write-Host "   • Press Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   • Select 'All time'" -ForegroundColor White
Write-Host "   • Check 'Cached images and files'" -ForegroundColor White
Write-Host "   • Click 'Clear data'" -ForegroundColor White

Write-Host ""
Write-Host "3. Hard refresh browser:" -ForegroundColor Yellow
Write-Host "   • Press Ctrl+Shift+R (3 times)" -ForegroundColor White

Write-Host ""
Write-Host "4. Restart dev server:" -ForegroundColor Yellow
Write-Host "   • Stop with Ctrl+C" -ForegroundColor White
Write-Host "   • Run: npm run dev" -ForegroundColor White

Write-Host ""
Write-Host "5. Test in incognito mode:" -ForegroundColor Yellow
Write-Host "   • Press Ctrl+Shift+N" -ForegroundColor White
Write-Host "   • Navigate to http://localhost:5173" -ForegroundColor White

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
