---
description: Quick commit with automatic message generation based on changes
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*)
---

# Quick Commit Command

Automatically stage all changes and create a commit with a generated message based on the changes.

Usage: `/quickcommit`

This command will:
1. Check git status to see untracked files
2. Check git diff to see staged and unstaged changes
3. Check recent commit messages to follow the repository's style
4. Add relevant files to staging
5. Create a commit with an appropriate message
6. Show final status