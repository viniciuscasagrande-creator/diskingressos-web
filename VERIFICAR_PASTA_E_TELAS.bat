@echo off
echo ==========================================
echo DiskIngressos - Diagnostico Advanced Taxas
echo ==========================================
echo.
echo Pasta atual:
cd
echo.
echo Verificando arquivos...
if exist src\pages\FinanceAdvancedTaxesPage.tsx (echo [OK] FinanceAdvancedTaxesPage) else (echo [ERRO] FinanceAdvancedTaxesPage nao encontrado)
if exist src\pages\FinanceSpread360Page.tsx (echo [OK] FinanceSpread360Page) else (echo [ERRO] FinanceSpread360Page nao encontrado)
if exist src\components\ModuleSidebar.tsx (echo [OK] ModuleSidebar) else (echo [ERRO] ModuleSidebar nao encontrado)
echo.
findstr /C:"Financeiro Advanced" src\components\ModuleSidebar.tsx
findstr /C:"page === 'finance-advanced'" src\App.tsx
echo.
pause
