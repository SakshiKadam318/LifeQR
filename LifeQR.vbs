' LifeQR Silent Launcher
' Double-click this to start LifeQR with NO black windows

Dim objShell
Set objShell = CreateObject("WScript.Shell")

' Get the folder where this script lives
Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))

' Kill old node processes
objShell.Run "taskkill /f /im node.exe", 0, True

' Start backend silently
objShell.Run "cmd /c cd /d """ & scriptDir & "backend"" && npm run dev > """ & scriptDir & "lifeqr-backend.log"" 2>&1", 0, False

' Wait 5 seconds
WScript.Sleep 5000

' Start frontend silently
objShell.Run "cmd /c cd /d """ & scriptDir & "frontend"" && set BROWSER=none && npm start >> """ & scriptDir & "lifeqr-frontend.log"" 2>&1", 0, False

' Wait 10 seconds for frontend to build
WScript.Sleep 10000

' Open browser
objShell.Run "http://localhost:3000"

' Show a small notification
MsgBox "LifeQR is running!" & Chr(13) & Chr(13) & "Open browser: http://localhost:3000" & Chr(13) & Chr(13) & "To stop, run STOP_LIFEQR.bat", 64, "LifeQR Started"

Set objShell = Nothing
