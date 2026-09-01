# ==============================================================================
# InfraPulse Agent — Windows Task Scheduler Uninstaller
# ==============================================================================

$TaskName = "InfraPulse-Agent"

Write-Host "Stopping and removing Windows Scheduled Task '$TaskName'..." -ForegroundColor Yellow

Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

Write-Host "Task '$TaskName' removed successfully." -ForegroundColor Green
