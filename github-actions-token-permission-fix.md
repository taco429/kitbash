# GitHub Actions Token Permission Fix

## The Problem
Your version bump GitHub Action is failing with exit code 128 and a 403 error because the default `GITHUB_TOKEN` doesn't have sufficient permissions to push changes back to your repository.

## Root Causes
1. **Missing Permissions**: The workflow doesn't explicitly set `contents: write` permission
2. **Branch Protection**: The main branch might have protection rules that prevent `GITHUB_TOKEN` from pushing
3. **Repository Settings**: The repository might have restrictive default permissions for `GITHUB_TOKEN`

## Solutions

### Solution 1: Add Explicit Permissions (Recommended)
Update your `version-bump.yml` workflow to include explicit permissions:

```yaml
name: Auto Version Bump

on:
  push:
    branches: [ main ]

jobs:
  version-bump:
    runs-on: ubuntu-latest
    # Add explicit permissions
    permissions:
      contents: write  # Required to push changes
      pull-requests: write  # If you need to create PRs
      actions: read  # Required to read actions
    
    if: "!contains(github.event.head_commit.message, 'chore: bump version')"
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Configure git
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
    
    - name: Bump version
      run: |
        # Get current version
        CURRENT_VERSION=$(node -p "require('./package.json').version")
        echo "Current version: $CURRENT_VERSION"
        
        # Bump patch version
        npm version patch --no-git-tag-version
        
        # Get new version
        NEW_VERSION=$(node -p "require('./package.json').version")
        echo "New version: $NEW_VERSION"
        
        # Commit the version bump
        git add package.json package-lock.json
        git commit -m "chore: bump version to $NEW_VERSION"
        
        # Push the changes
        git push origin main
        
        # Create and push a git tag
        git tag "v$NEW_VERSION"
        git push origin "v$NEW_VERSION"
        
        echo "Version bumped from $CURRENT_VERSION to $NEW_VERSION"
```

### Solution 2: Use a Personal Access Token (PAT)
If your repository has branch protection rules that prevent `GITHUB_TOKEN` from pushing:

1. **Create a Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`
   - Copy the token

2. **Add the PAT as a repository secret**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PAT_TOKEN`
   - Value: Your PAT token

3. **Update the workflow**:
```yaml
- name: Checkout
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.PAT_TOKEN }}  # Use PAT instead of GITHUB_TOKEN
    fetch-depth: 0
```

### Solution 3: Repository Settings Fix
Check and update your repository settings:

1. **Repository Permissions**:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

2. **Branch Protection Rules**:
   - Go to Settings → Branches
   - If the main branch has protection rules, either:
     - Add an exception for your GitHub Action
     - Or use a PAT (Solution 2)

### Solution 4: Alternative Approach with Pull Requests
Instead of pushing directly to main, create a pull request:

```yaml
name: Auto Version Bump

on:
  push:
    branches: [ main ]

jobs:
  version-bump:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    if: "!contains(github.event.head_commit.message, 'chore: bump version')"
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Configure git
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
    
    - name: Bump version and create PR
      run: |
        # Create a new branch
        BRANCH_NAME="version-bump-$(date +%s)"
        git checkout -b $BRANCH_NAME
        
        # Bump version
        CURRENT_VERSION=$(node -p "require('./package.json').version")
        npm version patch --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
        
        # Commit changes
        git add package.json package-lock.json
        git commit -m "chore: bump version to $NEW_VERSION"
        
        # Push branch
        git push origin $BRANCH_NAME
        
        # Create PR using GitHub CLI
        gh pr create --title "Auto Version Bump to $NEW_VERSION" --body "Automated version bump from $CURRENT_VERSION to $NEW_VERSION"
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Quick Fix for Your Current Issue

The fastest solution is **Solution 1**. Update your workflow file by adding the `permissions` section:

```yaml
permissions:
  contents: write
  actions: read
```

This should resolve the 403 error and allow your GitHub Action to push changes to your repository.

## Security Best Practices

1. **Use minimal permissions**: Only grant the permissions your workflow actually needs
2. **Prefer GITHUB_TOKEN over PATs**: The built-in token is more secure and automatically managed
3. **Consider using pull requests**: This adds a review step and works better with branch protection
4. **Regular token rotation**: If using PATs, rotate them regularly

## Testing the Fix

After implementing the fix:
1. Make a small change to your repository
2. Push to the main branch
3. Check the Actions tab to see if the workflow runs successfully
4. Verify that the version was bumped and tagged correctly

Choose the solution that best fits your repository's security requirements and branch protection setup.