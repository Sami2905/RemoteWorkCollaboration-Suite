# Save this as setup-github.ps1

# Function to check if a command exists
function Command-Exists {
    param($command)
    $exists = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
    return $exists
}

# Check if Git is installed
if (-not (Command-Exists "git")) {
    Write-Error "Git is not installed. Please install Git first: https://git-scm.com/downloads"
    exit 1
}

# Check if GitHub CLI is installed
$useGitHubCli = $false
if (Command-Exists "gh") {
    $useGitHubCli = $true
    Write-Host "GitHub CLI is installed and will be used for repository creation" -ForegroundColor Green
} else {
    Write-Host "GitHub CLI is not installed. You'll need to create the repository manually." -ForegroundColor Yellow
}

# Get repository name from current directory
$repoName = Split-Path -Leaf (Get-Location).Path
$repoName = $repoName -replace '[^\w-]', '-'  # Sanitize repo name

# Step 1: Clean up existing Git repository
if (Test-Path ".git") {
    Write-Host "Removing existing Git repository..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git
}

# Step 2: Initialize new Git repository
Write-Host "Initializing new Git repository..." -ForegroundColor Cyan
git init
git branch -M main

# Step 3: Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore file..." -ForegroundColor Cyan
    @"
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.env

# IDE
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Yjs
yjs-data/

# Cache
.cache/
.turbo/

# Debug
logs
*.log

# Temp files
*.tmp
*.temp

# System Files
.DS_Store
Thumbs.db
"@ | Out-File -FilePath ".gitignore" -Encoding utf8
}

# Step 4: Add files and make initial commit
Write-Host "Adding files and creating initial commit..." -ForegroundColor Cyan
git add .
git commit -m "Initial commit"

# Step 5: Create GitHub repository
if ($useGitHubCli) {
    Write-Host "Creating GitHub repository..." -ForegroundColor Cyan
    $repoUrl = gh repo create $repoName --public --source=. --remote=origin --push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Repository created successfully: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host "Failed to create repository. Please create it manually at https://github.com/new" -ForegroundColor Red
        Write-Host "Then run these commands:" -ForegroundColor Yellow
        Write-Host "git remote add origin https://github.com/YOUR-USERNAME/$repoName.git"
        Write-Host "git push -u origin main"
    }
} else {
    Write-Host "`nGitHub CLI not found. Please complete these steps manually:" -ForegroundColor Yellow
    Write-Host "1. Create a new repository at https://github.com/new" -ForegroundColor Cyan
    Write-Host "   - Name: $repoName" -ForegroundColor Cyan
    Write-Host "   - Description: Remote Work Collaboration Suite" -ForegroundColor Cyan
    Write-Host "   - Keep it public/private as per your preference" -ForegroundColor Cyan
    Write-Host "   - DO NOT initialize with README, .gitignore or license" -ForegroundColor Cyan
    Write-Host "2. Run these commands:" -ForegroundColor Cyan
    Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/$repoName.git" -ForegroundColor Cyan
    Write-Host "   git push -u origin main" -ForegroundColor Cyan
}

Write-Host "`nGitHub repository setup complete!" -ForegroundColor Green