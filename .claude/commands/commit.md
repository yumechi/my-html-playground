---
description: Stage all changes and create a git commit with a message
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
---

# Git Commit Command

Stage all changes and create a git commit with the provided message.

Usage: `/commit "commit message"`

The command will:
1. Show current git status
2. Add all changes to staging
3. Create a commit with your message
4. Show the final status

Please provide a commit message: $ARGUMENTS