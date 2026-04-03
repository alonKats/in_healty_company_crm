Analyze this project's codebase and write a comprehensive ARCHITECTURE.md at the project root.

Read the existing CLAUDE.md first if it exists — it contains project context.

Then scan the codebase and populate ARCHITECTURE.md with these sections:

## Overview
A 2-3 sentence description of what this project does, its purpose, and its tech stack.

## Directory Structure
List the key directories and what they contain. Skip node_modules, vendor, .git, build output. Use a tree format:
```
src/
  components/    — React/Vue components
  utils/         — Helper functions
...
```

## Key Components
The most important files/modules in the project. For each, one line explaining what it does and why it matters.

## Dependencies
Key dependencies from package.json, composer.json, requirements.txt, or similar. Group by purpose (framework, database, auth, etc.). Skip dev-only tools unless they're architecturally significant.

## Data Flow
If applicable, describe how data moves through the system (e.g., API request → controller → service → database).

Important:
- Be concise — this is a reference doc, not a tutorial
- Focus on what a developer needs to know to work in this codebase
- If sections don't apply (e.g., no data flow in a static site), skip them
- Overwrite the existing ARCHITECTURE.md completely
