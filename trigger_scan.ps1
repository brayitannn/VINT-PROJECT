Set-Location 'C:\Users\DELL\Downloads\front y api\VINT-PROJECT-clone'
Add-Content -Path README.md -Value "Trigger SonarCloud re-scan – $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git status
git add README.md
git commit -m "chore: trigger SonarCloud scan (hash already removed)"
git push origin develop
