# ==============================================================================
# InfraPulse 1-Line Windows PowerShell Agent Installer
# Usage:
#   irm https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.ps1 | iex
# ==============================================================================

param (
    [string]$ServerUrl = "https://infrapulse-backend-fddp.onrender.com/api/v1",
    [string]$Token = "infrapulse_secret_token_change_in_production",
    [int]$Interval = 30
)

$ErrorActionPreference = "Stop"
$InstallDir = "$env:ProgramData\InfraPulse"
$TaskName = "InfraPulse-Telemetry-Agent"
$GithubRaw = "https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "       ⚡ InfraPulse Windows Agent 1-Line PowerShell Installer     " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Target Server URL : $ServerUrl" -ForegroundColor White
Write-Host "Sampling Interval : ${Interval}s" -ForegroundColor White
Write-Host "Install Directory : $InstallDir" -ForegroundColor White
Write-Host "------------------------------------------------------------------" -ForegroundColor DarkGray

# 1. Check Python installation
$PythonCmd = Get-Command python.exe -ErrorAction SilentlyContinue
if (-not $PythonCmd) {
    Write-Host "[!] Python is not found in PATH. Please install Python 3.10+ and re-run." -ForegroundColor Red
    exit 1
}

# 2. Install required Python packages
Write-Host "[*] Installing required Python libraries (psutil, requests)..." -ForegroundColor Yellow
& python -m pip install --upgrade --quiet pip
& python -m pip install --quiet psutil requests

# 3. Create Install Directory
Write-Host "[*] Setting up directory: $InstallDir" -ForegroundColor Yellow
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

# 4. Download files directly from GitHub
Write-Host "[*] Downloading agent files from GitHub repository..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "$GithubRaw/monitor_agent.py" -OutFile "$InstallDir\monitor_agent.py" -UseBasicParsing
Invoke-WebRequest -Uri "$GithubRaw/collector.py" -OutFile "$InstallDir\collector.py" -UseBasicParsing
Invoke-WebRequest -Uri "$GithubRaw/buffer.py" -OutFile "$InstallDir\buffer.py" -UseBasicParsing

# 5. Create config.json
Write-Host "[*] Writing configuration file..." -ForegroundColor Yellow
$ConfigJson = @"
{
  "server_url": "$ServerUrl",
  "agent_secret_token": "$Token",
  "interval_seconds": $Interval,
  "max_buffer_records": 1000,
  "timeout_seconds": 10,
  "db_path": "$($InstallDir.Replace('\', '/'))/agent_buffer.db"
}
"@
Set-Content -Path "$InstallDir\config.json" -Value $ConfigJson -Encoding UTF8

# 6. Register Background Daemon (Scheduled Task or Startup Folder Fallback)
Write-Host "[*] Registering 24/7 background execution..." -ForegroundColor Yellow
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    $Action = New-ScheduledTaskAction -Execute "pythonw.exe" -Argument "`"$InstallDir\monitor_agent.py`" --config `"$InstallDir\config.json`"" -WorkingDirectory $InstallDir
    $Trigger = New-ScheduledTaskTrigger -AtLogOn
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit 0 -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

    if ($IsAdmin) {
        Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "InfraPulse DCIM Background Telemetry Agent" -User "SYSTEM" -RunLevel Highest | Out-Null
    } else {
        Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "InfraPulse DCIM Background Telemetry Agent" | Out-Null
    }
    Start-ScheduledTask -TaskName $TaskName
} catch {
    Write-Host "[*] Setting up auto-start via Windows User Startup daemon..." -ForegroundColor Yellow
    $StartupDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
    $VbsScript = "Set WshShell = CreateObject(`"WScript.Shell`")`nWshShell.Run `"pythonw.exe `"`"$($InstallDir.Replace('\', '\\'))\\monitor_agent.py`"`" --config `"`"$($InstallDir.Replace('\', '\\'))\\config.json`"`"`, 0, False"
    Set-Content -Path "$StartupDir\InfraPulse-Agent.vbs" -Value $VbsScript -Encoding ASCII
    Start-Process "pythonw.exe" -ArgumentList "`"$InstallDir\monitor_agent.py`" --config `"$InstallDir\config.json`"" -WorkingDirectory $InstallDir
}

Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  [OK] InfraPulse Windows Agent successfully installed & running! " -ForegroundColor Green
Write-Host "  Telemetry stream is now active and transmitting to your Dashboard. " -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
