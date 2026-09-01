# ==============================================================================
# InfraPulse Agent — Windows Task Scheduler Installer
# ==============================================================================

$TaskName = "InfraPulse-Agent"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentDir = Split-Path -Parent $ScriptDir
$AgentScript = Join-Path $AgentDir "monitor_agent.py"
$ConfigFile = Join-Path $AgentDir "config.json"
$ConfigExample = Join-Path $AgentDir "config.example.json"

Write-Host "=== Installing InfraPulse Agent as Windows Scheduled Task ===" -ForegroundColor Cyan

# 1. Check Python executable (prefer pythonw.exe to run silently in background without CMD window)
$PythonPath = (Get-Command pythonw.exe -ErrorAction SilentlyContinue).Source
if (-not $PythonPath) {
    $PythonPath = (Get-Command python.exe -ErrorAction SilentlyContinue).Source
}

if (-not $PythonPath) {
    Write-Error "Python was not found in system PATH. Please ensure Python 3.10+ is installed and added to PATH."
    exit 1
}

Write-Host "Detected Python: $PythonPath" -ForegroundColor Green

# 2. Ensure config.json exists
if (-not (Test-Path $ConfigFile)) {
    if (Test-Path $ConfigExample) {
        Copy-Item $ConfigExample $ConfigFile
        Write-Host "Created config.json from template." -ForegroundColor Yellow
    }
}

# 3. Define Scheduled Task Action & Trigger
$Action = New-ScheduledTaskAction `
    -Execute $PythonPath `
    -Argument "`"$AgentScript`" --config `"$ConfigFile`"" `
    -WorkingDirectory $AgentDir

$Trigger = New-ScheduledTaskTrigger -AtLogOn

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Days 0) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# 4. Unregister existing task if present
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# 5. Register new Task for current user
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "InfraPulse Telemetry Monitoring Agent background service"

Write-Host "Starting InfraPulse-Agent task..." -ForegroundColor Cyan
Start-ScheduledTask -TaskName $TaskName

Write-Host "`n=== Installation Succeeded! ===" -ForegroundColor Green
Write-Host "Task '$TaskName' is now registered and running."
Write-Host "To check task status: Get-ScheduledTask -TaskName '$TaskName'"
