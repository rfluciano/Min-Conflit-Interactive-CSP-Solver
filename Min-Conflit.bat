@echo off
:: ====================================================================
:: LANCEUR INTERACTIF PORTABLE - MIN-CONFLICT CSP SOLVER
:: ====================================================================
title Min-Conflit CSP Solver
color 0E

echo.
echo   ====================================================================
echo     MIN-CONFLICT INTERACTIVE CSP SOLVER - ORCHESTRATEUR DE PORTFOLIO
echo   ====================================================================
echo.

:: Configuration de l'environnement reseau
set APP_PORT=5001
set APP_HOST=127.0.0.1
set APP_DEBUG=0

echo [INFO] Recherche de la configuration d'environnement...

:: Detection de l'environnement virtuel Python
set PYTHON_EXE=python
if exist "Scripts\python.exe" (
    echo [ENV] Environnement virtuel local trouve et active dans : Scripts\python.exe
    set PYTHON_EXE=Scripts\python.exe
) else (
    echo [ENV] Aucun environnement virtuel local trouve. Tentative via le Python systeme...
)

:: Verification que Python est accessible
"%PYTHON_EXE%" --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERREUR] Python n'est pas installe ou n'est pas accessible dans votre PATH !
    echo Veuillez installer Python 3.10+ ou activer votre environnement virtuel.
    echo.
    pause
    exit /b 1
)

:: Demarrage du serveur Flask en arriere-plan
echo [SERVEUR] Lancement de l'application Flask en arriere-plan sur le port %APP_PORT%...
start "Flask Min-Conflit Server" /B "%PYTHON_EXE%" app.py

:: Pause de 2 secondes pour s'assurer que Flask a bien demarre
timeout /t 2 /nobreak >nul

:: Ouverture de la page d'accueil dans le navigateur par defaut
echo [NAVIGATEUR] Redirection automatique vers la Landing Page...
start http://%APP_HOST%:%APP_PORT%/

echo.
echo ====================================================================
echo   SERVEUR ACTIF : http://%APP_HOST%:%APP_PORT%/
echo.
echo   Le solver s'execute en tache de fond. Vous pouvez utiliser :
echo   - La Landing Page : http://%APP_HOST%:%APP_PORT%/
echo   - Le Dashboard    : http://%APP_HOST%:%APP_PORT%/app
echo.
echo   [ASTUCE HORS-LIGNE] Si le serveur Flask est arrete, l'application
echo   bascule automatiquement et de maniere transparente en mode local 
echo   dans votre navigateur grace aux solvers Javascript embarques !
echo ====================================================================
echo.
echo Appuyez sur n'importe quelle touche pour ARRETER le serveur et quitter...
pause >nul

:: Fermeture propre du processus d'arriere-plan Flask
echo.
echo [SERVEUR] Arret propre et liberation du port %APP_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%APP_PORT% ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo [SERVEUR] Processus arrete et port libere.
echo.
echo Merci d'avoir teste le Min-Conflict CSP Solver ! A bientot.
timeout /t 2 >nul
