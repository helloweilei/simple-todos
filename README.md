# simple-todos

A React + [Ink](https://github.com/vadimdemedes/ink) interactive CLI todo list manager with a Claude Code-style REPL interface.

```
Todo List (2 tasks)

  [t_1a2b3c]  ☐  Buy groceries       (5/11/2026)
  [t_3d4e5f]  ☑  Write report        (5/10/2026)

1/2 completed

✓ Added: Buy groceries

> █
```

## Install

```bash
npm install -g simple-todos
```

Or run directly:

```bash
npx simple-todos
```

## Usage

Start the interactive prompt:

```bash
todo
```

### Commands

| Command             | Example        | Description                                                    |
| ------------------- | -------------- | -------------------------------------------------------------- |
| `add <description>` | `add Buy milk` | Add a new task                                                 |
| `list`              | `list`         | Show all tasks (default view), `list done=true` show all tasks |
| `done <id>`         | `done t_1a2b`  | Toggle task completion                                         |
| `del <id>`          | `del t_1a2b`   | Delete a task                                                  |
| `clear`             | `clear`        | Remove all completed tasks                                     |
| `help`              | `help`         | Show command help                                              |
| `exit` / `quit`     | `exit`         | Exit the program                                               |

`Ctrl+C` or `Ctrl+D` also exits.

### Interactive Features

- Real-time list updates after every command
- Color-coded status: green for completed, yellow for pending
- Visual cursor indicator in the input prompt
- Task IDs are shown truncated (e.g. `t_1a2b3c`) for easy reference

## Data Storage

Tasks are stored in `~/.simple-todos/todos.json` as plain JSON. Key safeguards:

- **Atomic writes** — data is written to a temp file first, then atomically renamed
- **Auto-backup** — the previous state is saved to `todos.json.bak` before each write
- **Corruption recovery** — if `todos.json` is corrupted, the tool attempts recovery from the backup; if both are damaged, it starts fresh rather than crashing
- **Secure directory** — created with `0o700` permissions

## Development

```bash
# Clone and install
git clone <repo-url>
cd simple-todos
npm install

# Run in dev mode (tsx, no build needed)
npm run dev

# Build for production
npm run build

# Run compiled version
npm start
```

### Project Structure

```
src/
├── index.tsx              # CLI entry point with shebang
├── types.ts               # Todo interface
├── utils.ts               # ID generation helpers
├── store.ts               # JSON file persistence (read/write/backup)
├── commands.ts             # Command dispatch and processing
└── components/
    ├── App.tsx             # Interactive REPL loop
    ├── Prompt.tsx          # Input prompt with cursor
    ├── TodoList.tsx        # Task list rendering
    └── TodoItem.tsx        # Single task line rendering
```

## Release

```bash
# Bump version
npm version patch   # or minor / major

# Push tags to trigger the publish workflow
git push --follow-tags
```

The [publish workflow](.github/workflows/publish.yml) automatically builds and publishes to npm when a `v*` tag is pushed.

Before your first publish, add your npm access token to GitHub Secrets:

```
Settings → Secrets and variables → Actions → New repository secret
Name: NPM_TOKEN
Value: <your npm token>
```

## License

MIT
