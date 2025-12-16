<!-- Auto-generated: update by AI agent; please review and customize -->
# Copilot / AI Agent Instructions

This file gives actionable, repository-specific guidance for code-writing AI agents working in this workspace.

Summary
- Repo state: no source files detected at scan time. Agents should first discover project type and entry points before making changes.

Immediate discovery steps (run before making edits)
- Check for common manifests: `package.json`, `pyproject.toml`, `requirements.txt`, `setup.py`, `*.csproj`, `pom.xml`, `go.mod`, `Dockerfile`.
- Probe with these commands (Windows PowerShell examples):

```powershell
Get-ChildItem -Recurse -File -Include package.json,pyproject.toml,requirements.txt,setup.py,*.csproj,pom.xml,go.mod,Dockerfile
git ls-files --others --exclude-standard
```

How to infer architecture
- Look for language-specific roots: `*.sln` / `*.csproj` → .NET; `package.json` → Node; `pyproject.toml`/`requirements.txt` → Python.
- If multiple services exist, their folders commonly contain an independent manifest each (e.g., `service-a/package.json`, `service-b/requirements.txt`).

Project conventions (what I looked for)
- No existing `README.md` or AI instruction files were found during the scan. If present, prefer instructions in `README.md` or `.github/*` to avoid conflicting policies.
- Naming: look for folders named `src`, `api`, `web`, `app`, `services` for service boundaries.

Safe editing rules for this repo
- Do not create or modify production infrastructure files (CI/CD) without explicit human approval.
- When the codebase is empty, create only scaffold files requested by maintainers or add non-breaking documentation (`.github/copilot-instructions.md`, `README.md`).

When you find source code: immediate next actions
- Open the project manifest and list build/test commands. Add them to the PR description.
- Run lightweight static checks only (lint/typecheck) — do not run untrusted code without the user's permission.

Examples of useful patterns to include in commits
- Add a short note in PRs: what files changed, why, and how to run quick verification commands found in project manifest.

Merge guidance (if existing `copilot-instructions.md` exists)
- Preserve top-level maintainer notes and any explicit `DO NOT EDIT` sections.
- Keep this file concise — prefer actionable discovery steps and exact commands.

If you are the human maintainer
- Add a minimal `README.md` and one manifest file (e.g., `package.json` or `pyproject.toml`) so agents can detect project type automatically.

Questions or missing info
- I detected no source code; tell me which language or add a manifest and I will generate more targeted instructions.

-- End
