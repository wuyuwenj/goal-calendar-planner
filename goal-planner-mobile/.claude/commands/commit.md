# Commit with Dev Log

When committing changes, ALWAYS follow these steps:

## 1. Check for changes
Run `git status` to see what files have been modified/added.

## 2. Create or update dev-log
Before committing, create or update the dev-log file for today's date:
- Location: `dev-logs/YYYY-MM-DD.md`
- If file exists for today, append to it under a new section
- If file doesn't exist, create it

## 3. Dev-log format
```markdown
# Dev Log - YYYY-MM-DD

## Session Summary
[Brief 1-2 sentence summary]

## What We Did
[Detailed bullet points of what was accomplished]

## Commits
- `[hash]` - [commit message]

## Next Steps
[Optional: what to do next]
```

## 4. Commit together
Add BOTH the changes AND the dev-log file in the SAME commit:
```bash
git add [changed files] dev-logs/YYYY-MM-DD.md
git commit -m "..."
```

## 5. Commit message format
Use conventional commits:
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation
- `refactor:` - code refactoring
- `chore:` - maintenance

Always end with:
```

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## 6. Push
After committing, push to remote:
```bash
git push
```
