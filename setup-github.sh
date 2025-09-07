#!/bin/bash

# GitHub Repository Setup Script for Converge Chat Application
# This script helps you create a GitHub repository and push your code

echo "🚀 Setting up GitHub repository for Converge Chat Application"
echo "=============================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Create a new repository on GitHub${NC}"
echo "Please follow these steps:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: converge-chat"
echo "3. Description: Real-time chat application with microservices architecture"
echo "4. Set to Public or Private (your choice)"
echo "5. DO NOT initialize with README, .gitignore, or license (we already have these)"
echo "6. Click 'Create repository'"
echo ""

echo -e "${YELLOW}After creating the repository, GitHub will show you commands to push existing code.${NC}"
echo "The commands will look like this:"
echo ""
echo "git remote add origin https://github.com/medhruv7/converge-chat.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""

read -p "Press Enter after you've created the repository on GitHub..."

echo -e "${BLUE}Step 2: Adding remote origin${NC}"
echo "Adding GitHub remote origin..."

# Add the remote origin
git remote add origin https://github.com/medhruv7/converge-chat.git

echo -e "${BLUE}Step 3: Setting main branch${NC}"
git branch -M main

echo -e "${BLUE}Step 4: Pushing to GitHub${NC}"
echo "Pushing code to GitHub repository..."

# Push to GitHub
git push -u origin main

echo ""
echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo ""
echo "Your repository is now available at:"
echo "https://github.com/medhruv7/converge-chat"
echo ""
echo "You can now:"
echo "- Share the repository with others"
echo "- Clone it on other machines"
echo "- Set up CI/CD pipelines"
echo "- Collaborate with other developers"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Set up branch protection rules"
echo "2. Configure GitHub Actions for CI/CD"
echo "3. Add collaborators if needed"
echo "4. Create issues for future improvements"
