# Laracasts - The Ralph Wiggum Technique

## Episode 01 — What Is Ralph?

- **A Ralph Loop runs a coding agent repeatedly so it can finish small tasks without human input each time.**
  ```bash
  for i in $(seq 1 "$iterations"); do
      result=$(claude -p "$(cat prompt.md)")
  done
  ```

- **Print mode turns an agent into a scriptable command because it returns output instead of opening an interactive session.**
  ```bash
  claude -p "Say hello world"
  ```

- **Keep the agent focused by asking it to complete exactly one project task per loop.**
  ```md
  Find the highest priority task in project.md and implement only that task.
  ```

- **Use project and progress files as external memory between fresh agent sessions.**
  ```md
  Append progress to progress.md, then check off the completed task in project.md.
  ```

- **A fixed completion phrase lets the script stop automatically when all work is done.**
  ```bash
  if [[ "$result" == *"ALL_TASKS_COMPLETE"* ]]; then
      break
  fi
  ```

- **Fresh sessions help avoid context-window decay while still preserving useful state in files.**
  ```bash
  # Each iteration starts a new agent process with the same project files.
  claude -p "$(cat prompt.md)"
  ```

- **Small project tasks make the loop safer because each iteration can produce a reviewable change.**
  ```md
  - [ ] Add a /hello-agent route.
  - [ ] Add confetti when the title is clicked.
  ```

- **Permission settings reduce risk by allowing expected commands and denying destructive ones.**
  ```md
  Allow: npm install, npm create
  Deny: rm -rf, git reset --hard
  ```

## Episode 02 — Improving Our First Ralph Loop

- **The official CLI plugin runs the loop inside the context window, so memory accumulates and eventually needs compacting.**
  ```bash
  ralf loop
  ```

- **Avoid the official plugin because it defeats Ralph's core idea: start fresh each iteration and externalize memory to markdown files.**

- **Use the `--output-format stream-json` flag to stream model output as it arrives, instead of waiting for print mode to finish.**
  ```bash
  claude -p --output-format stream-json --verbose "Read the file"
  ```

- **Parse the JSON stream into human-readable strings so you can watch the model work in real time.**
  ```js
  // Each line is a JSON object — parse it and extract the message type.
  const parsed = JSON.parse(line);
  ```

- **The core Ralph architecture stays the same — a for loop — you are only improving observability.**
  ```js
  for (let i = 0; i < iterations; i++) {
      // run agent, parse stream output
  }
  ```

- **Generate test messages before prompting your coding agent so it has a concrete example of the JSON format to work with.**
  ```bash
  claude -p --output-format stream-json --verbose "Read file, fetch url, run command" > example.txt
  ```

## Episode 03 — What Is A PRD?

- **A PRD (Product Requirement Document) describes the problem, goal, constraints, and success criteria so you understand what to build before building it.**
  ```md
  Problem: Onboarding is a massive form with no language support.
  Goal: Modernize UX, collect business category, reduce time to first order.
  ```

- **Agent-ready PRDs go deeper than human PRDs because agents don't attend meetings — they only execute what's written.**
  ```md
  Include: code examples, API contracts, database schemas, pseudocode.
  ```

- **The implementation tasks list is the most important section — the model works through tasks one at a time, checking each off before exiting.**
  ```md
  - [ ] Create migration to add category column to business table.
  - [ ] Create BusinessCategory enum.
  - [ ] Create OnboardingController.
  ```

- **Front-load important decisions in the PRD so the model has a strong outline and fills in the blanks.**
  ```md
  Add column at end of table to avoid MySQL table rebuild and downtime.
  Reuse existing component library for dropdowns and selects.
  ```

- **Define what's out of scope to prevent the model from adding unnecessary features.**
  ```md
  Out of scope: email verification, social logins.
  ```

- **Include technical details like specific database changes so the model doesn't make unsafe assumptions.**
  ```sql
  -- Bad: triggers table rebuild
  ALTER TABLE businesses ADD category VARCHAR AFTER title;

  -- Good: appends column safely
  ALTER TABLE businesses ADD category VARCHAR;
  ```

- **A PRD forces you to think about the problem and front-load decisions before the model starts coding.**

## Episode 04 — Creating A PRD With Our PRD Skill

- **A PRD skill is a markdown file with front matter that instructs the model on how to format agent-ready PRDs.**
  ```md
  ---
  name: PRD
  description: Create a product requirement document for handoff to an AI agent.
  ---
  ```

- **Set the skill to ask clarifying questions so it behaves like plan mode and gathers requirements before writing.**
  ```md
  Ask clarifying questions to fully understand the feature's scope.
  Research the codebase and explore relevant parts.
  ```

- **Use a PRD directory workflow: to-refine (model outputs here) → backlog (you approve for Ralph loop) → complete (finished reference).**
  ```bash
  prd/to-refine/snackbar-web-shop.md
  prd/backlog/snackbar-web-shop.md
  prd/complete/snackbar-web-shop.md
  ```

- **Include a template in the skill so the model outputs consistent PRDs with sections like goals, user stories, requirements, database changes, and implementation tasks.**
  ```md
  ## Implementation Tasks
  - [ ] [HIGH] Clean up boilerplate and create base files.
  - [ ] [MEDIUM] Add visual feedback on add to cart.
  - [ ] [LOW] Add hover effects and transitions.
  ```

- **Guidelines in the skill prevent vague requirements — explain why, not just what, and keep scope bounded.**
  ```md
  Vague requirements lead to misaligned implementations.
  Include context. Explain why, not just what.
  Keep the scope bounded.
  ```

- **Set iteration count higher than the number of tasks so the Ralph loop completes without hitting max iterations.**
  ```bash
  # 10 tasks but only 10 iterations = may not finish
  for i in $(seq 1 20); do ... done
  ```

- **Destructive commands like `rm` are disallowed by permission settings, so the model skips file deletion and unused files may remain.**
  ```md
  Deny: rm -rf, git reset --hard
  ```

## Episode 05 — Running Ralph In The Background

- **Use `screen` to keep processes running even after closing the terminal, so Ralph loops don't lose progress.**
  ```bash
  screen
  ```

- **Name your screen sessions so you can identify and reattach to the right one later.**
  ```bash
  screen -s Ralph
  ```

- **Detach from screen with `Ctrl+A, D` and reattach with `screen -r` to check in on a running loop.**
  ```bash
  screen -r Ralph
  ```

- **List all detached screen sessions to see what's still running in the background.**
  ```bash
  screen -ls
  ```

- **`tmux` is a modern, more flexible alternative to screen — the basics are all you need to get started.**
  ```bash
  tmux new -s Ralph
  ```

- **Detach from tmux with `Ctrl+B, D` and reattach with `tmux attach -t` followed by the session name.**
  ```bash
  tmux attach -t Ralph
  ```

- **Split panes in tmux to run multiple tools side by side — `Ctrl+B, %` splits horizontally, `Ctrl+B, "` splits vertically.**
  ```bash
  # Left pane: lazygit
  # Right pane: Claude running a Ralph loop
  ```

- **Navigate between panes with `Ctrl+B` and arrow keys, or enable mouse support for click-to-focus.**
  ```bash
  set -g mouse on
  ```

- **Add `set -g mouse on` to `~/.tmux.conf` so mouse interaction is enabled by default in every session.**
  ```bash
  nano ~/.tmux.conf
  ```

- **Synchronize panes to type the same input across multiple panes at once — useful for running the same prompt in multiple agents.**
  ```bash
  set-window-option synchronize-panes on
  ```

- **Stick close to tmux defaults instead of heavy customization — muscle memory makes the commands second nature within a day or two.**

- **Use tmux where possible; screen is a great fallback for environments that can't install tmux.**

## Episode 06 — Permissions And Sandboxing

- **Accept Edits mode only auto-accepts file modifications — bash commands still require separate permission.**
  ```md
  Accept Edits: auto-accepts file writes
  Bash commands: still prompt for approval
  ```

- **Use allow and deny lists to control which bash commands run without prompting.**
  ```json
  "allow": ["npm install", "npm run *"],
  "deny": ["rm *", "git rm *"]
  ```

- **Glob patterns work anywhere in the command — word boundary matters for matching.**
  ```md
  "ls *"   → matches "ls -la" but not "lsfoo"
  "ls*"    → matches "lsfoo" and "ls -la"
  ```

- **The deny list always wins over the allow list, so block destructive commands explicitly.**
  ```json
  "deny": ["rm *", "read .env*"]
  ```

- **In print mode (Ralph loops), permission requests fail silently because there's no interactive prompt — the model must work around it.**
  ```bash
  # This fails in print mode — no way to approve interactively
  claude -p "curl https://laracasts.com"
  ```

- **Enable native sandboxing to auto-allow safe bash commands while blocking risky operations at the OS level.**
  ```md
  sandbox → sandbox bash tool with auto allow
  ```

- **The sandbox blocks all outbound network connections by default, reducing prompt injection and data exfiltration risk.**
  ```md
  curl https://laracasts.com → fails in sandbox
  ```

- **Allow specific domains in the sandbox settings when the model needs network access.**
  ```json
  "sandbox": {
    "network": { "allowDomains": ["laracasts.com"] }
  }
  ```

- **The sandbox allows reading the entire file system but restricts writes to the current working directory by default.**
  ```md
  Read:  allowed everywhere
  Write: scoped to current directory
  ```

- **Customize file permissions in the sandbox to allow or deny read/write access to specific paths.**
  ```json
  "sandbox": {
    "fileSystem": {
      "allowWrite": ["fastlane"],
      "denyWrite": [".github"],
      "denyRead": [".aws"]
    }
  }
  ```

- **Use `excludedCommands` for tools that don't work inside the sandbox, like Docker.**
  ```json
  "sandbox": {
    "excludedCommands": ["docker"]
  }
  ```

- **Enable sandbox fallback so commands that fail due to sandbox restrictions fall back to the normal permission flow.**
  ```md
  Overrides → allow un-sandboxed fallback
  ```

## Episode 07 — Configuring Hooks

- **Native sandboxing only auto-allows bash commands; MCP tools still go through the normal permission flow.**
  ```md
  Sandbox auto-allow: Bash(...)
  MCP tool call: asks for permission
  ```

- **Use a `PreToolUse` hook when static allow and deny lists are too broad for a tool.**
  ```json
  {
    "hooks": {
      "PreToolUse": [
        {
          "matcher": "mcp__chrome-devtools__.*",
          "hooks": []
        }
      ]
    }
  }
  ```

- **Move MCP permissions out of the allow list and into a hook when you need to inspect the request details.**
  ```json
  {
    "allow": [],
    "hooks": {
      "PreToolUse": [
        { "matcher": "mcp__chrome-devtools__.*" }
      ]
    }
  }
  ```

- **A command hook can allow or deny a tool call by printing the expected hook output JSON.**
  ```json
  {
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "No fetching laracars.com; use laracars.test."
    }
  }
  ```

- **Write deny reasons as instructions because the model can read them and try a safer alternative.**
  ```json
  {
    "permissionDecision": "deny",
    "permissionDecisionReason": "Use https://laracars.test instead."
  }
  ```

- **Log hook input and decisions while debugging so you can see which tool call was allowed or blocked.**
  ```bash
  printf '%s\n' "$HOOK_INPUT" >> pre-dev-tools.log
  ```

- **Prompt-based hooks can ask another model to decide, but a command that runs a prompt file is easier to maintain.**
  ```json
  {
    "type": "command",
    "command": "claude -p < .claude/hooks/pre-tool-use.md"
  }
  ```

- **A generic security-review hook can inspect every permission request, but it adds latency and token cost.**
  ```json
  {
    "matcher": "",
    "hooks": [
      { "type": "command", "command": "claude -p < .claude/hooks/review-tool.md" }
    ]
  }
  ```

- **Use generic reviewer hooks for unattended Ralph loops when the extra safety is worth slower tool calls.**
  ```md
  Overnight loop: useful safety net
  Interactive session: often too slow
  ```

## Episode 08 — A Word On Auto Mode

- **Auto Mode lets Claude decide permission requests automatically, similar to a prompt-based `PreToolUse` security hook.**
  ```bash
  claude --enable-auto-mode
  ```

- **Auto Mode uses a separate classifier model to approve safe tool calls without pausing for manual permission.**
  ```md
  Tool request → Auto Mode classifier → allow or block
  ```

- **Expect extra latency and token usage because permission requests are reviewed by the classifier.**
  ```md
  Safer unattended runs → extra model call → slower tool use
  ```

- **Auto Mode ignores blanket shell allow rules so broad bash access cannot bypass its safety checks.**
  ```md
  Bash(*) allow rule → ignored in Auto Mode
  ```

- **Auto Mode reduces prompt-injection risk by stripping tool results before permission review.**
  ```md
  External site content → not trusted as permission context
  ```

- **Auto Mode blocks destructive or irreversible actions like deployments and infrastructure changes.**
  ```md
  Deploy production → blocked
  Modify infrastructure → blocked
  ```

- **Auto Mode is promising for unattended Ralph loops, but research-preview flakiness can stall print-mode runs.**
  ```md
  Auto Mode unavailable → regular permissions fallback → print mode stalls
  ```

## Episode 09 — Bypassing Permissions Safely

- **Bypass Permissions mode removes normal approval prompts, so only use it when another safety boundary is active.**
  ```bash
  claude --dangerously-skip-permissions
  ```

- **You can make bypass mode the default, but every new Claude session will start without regular permission checks.**
  ```md
  Settings → Default mode → Bypass Permissions
  ```

- **The native sandbox still runs in bypass mode, but unsandboxed fallback gets auto-allowed unless something else blocks it.**
  ```md
  Sandbox command → auto-allowed
  Outside sandbox → bypass mode auto-allows
  ```

- **The allow list becomes redundant in bypass mode, but the deny list still blocks dangerous commands.**
  ```json
  {
    "deny": ["rm *", "git reset --hard"]
  }
  ```

- **`PreToolUse` hooks still fire in bypass mode, so hooks remain useful for logging and targeted denials.**
  ```json
  {
    "hooks": {
      "PreToolUse": [{ "matcher": "mcp__chrome-devtools__.*" }]
    }
  }
  ```

- **Use strict sandbox mode when you do not want Bash commands to fall back to unsandboxed execution.**
  ```md
  Overrides → allow un-sandboxed fallback: off
  ```

- **The OS enforces strict sandbox file rules, so Claude cannot bypass a denied write from inside Bash.**
  ```bash
  echo "hello world" > prd/test.txt
  # denied when prd is denyWrite and fallback is disabled
  ```

- **Native sandboxing protects Bash tool execution, not every tool the agent can call.**
  ```md
  Bash(...) → sandboxed
  Other tool calls → rely on their own controls
  ```

- **Host access is risky because the agent can run installed CLIs with your local credentials.**
  ```bash
  aws ec2 describe-regions
  ```

- **Container sandboxes reduce host risk by giving the agent unrestricted access only inside an isolated environment.**
  ```md
  Host machine → container boundary → mounted project directory
  ```

- **yolobox is useful for Ralph loops because it mounts the project while keeping the host home directory separate.**
  ```bash
  yolobox claude --claude-config --git-config
  ```

- **Customize the yolobox container per project instead of relying on tools installed on the host.**
  ```toml
  # .yolobox.toml
  [customize]
  packages = ["php8.3"]
  ```

- **Mount Docker only when the agent needs project services because it gives the container more power.**
  ```bash
  yolobox claude --docker --git-config --gh-token
  ```

- **Use `--no-network` when you want to block internet access and reduce exfiltration risk.**
  ```bash
  yolobox run --no-network curl https://google.com
  ```

## Episode 10 — Turning Our Ralph Script Into A Flexible CLI

- **Write a PRD before replacing a script so the agent has clear CLI requirements and boundaries.**
  ```md
  Build a Bun-powered Ralph CLI in ./ralph-cli with tabs, streaming output, and yolobox support.
  ```

- **Create the rewrite in a new directory when the existing script still works and can run one final implementation loop.**
  ```bash
  yolobox node ralph.js 30
  ```

- **Use a terminal UI when a loop needs live controls instead of only start-and-wait behavior.**
  ```md
  Top tabs: agent-1 | agent-2 | agent-3
  Bottom status: C spawn | X close | Q quit
  ```

- **Load PRDs from the backlog so spawning a new agent starts from approved work, not an ad hoc prompt.**
  ```js
  const prds = await readdir('prd/backlog');
  ```

- **Stream `claude -p` JSON output into each tab so every running agent stays observable.**
  ```bash
  claude -p --output-format stream-json --verbose "$prompt"
  ```

- **Add a `--yolobox` flag when sandboxing should be a launch-time choice instead of a separate workflow.**
  ```bash
  yolobox claude --claude-config --git-config -- -p --output-format stream-json --verbose "$prompt"
  ```

- **Build and install the Bun CLI globally so Ralph can run from any project directory.**
  ```bash
  bun run build
  bun run install-cli
  ralph
  ```

- **Parallel agent tabs improve control, but agents working in the same directory can still conflict.**
  ```md
  agent-1 edits checkout.md
  agent-2 edits checkout.md
  # Shared workspace conflicts need a separate solution.
  ```

## Episode 11 — Agent Workspaces

- **Run agents in isolated workspaces so your main branch stays usable while Ralph loops are running.**
  ```md
  main/        # your active work
  workspaces/  # agent branches or copies
  ```

- **Use `git worktree` when you want a separate checkout with its own branch but shared git history.**
  ```bash
  git worktree add -b my-feature ../view-shop-my-feature
  ```

- **Bootstrap worktrees because untracked files like dependencies and env files are not copied automatically.**
  ```bash
  cd ../view-shop-my-feature
  yarn install
  yarn dev
  ```

- **Use a `post-checkout` hook to install dependencies when a new worktree is missing them.**
  ```bash
  if [ ! -d node_modules ]; then
      yarn install
  fi
  ```

- **Clean up worktrees through git so stale worktree records and temporary branches do not pile up.**
  ```bash
  git worktree remove ../view-shop-my-feature
  git branch -D my-feature
  ```

- **Run `git worktree prune` when you deleted the folder manually and git still lists it as prunable.**
  ```bash
  rm -rf ../view-shop-my-feature
  git worktree prune
  ```

- **Use Portless to give each running dev server a stable URL instead of chasing changing Vite ports.**
  ```bash
  portless run yarn dev --host
  ```

- **Portless can name worktree URLs from the branch, which makes testing multiple branches easier.**
  ```md
  main       → https://view-shop.portless.test
  my-feature → https://my-feature.view-shop.portless.test
  ```

- **Configure Ralph's workspace handling so unattended loops create workspaces in a predictable place.**
  ```toml
  workspace_mode = "worktree"
  workspace_directory = "workspaces"
  yolobox = true
  ```

- **Use copy-on-write when you want a fast workspace clone without duplicating unchanged files.**
  ```bash
  cp -R -C view-shop view-shop-cow
  ```

- **Copy-on-write keeps dependencies and env files available immediately because it starts from the full directory snapshot.**
  ```bash
  cd ../view-shop-cow
  test -d node_modules && yarn dev
  ```

- **Prefer worktrees on Windows because copy-on-write is mainly practical on APFS and Btrfs file systems.**
  ```md
  macOS APFS → copy-on-write works
  Linux Btrfs → copy-on-write works
  Windows → use git worktree
  ```

- **Name Portless projects manually for copy-on-write folders because they are not git worktrees.**
  ```bash
  portless view-shop-persistent-cart yarn dev --host
  ```

- **Merge completed agent branches back into main, then retest the combined behavior after resolving conflicts.**
  ```bash
  git merge my-feature
  git merge persistent-cart
  yarn dev
  ```

## Episode 12 — Tracking PRDs With Linear

- **Use Linear when file-based PRDs become too flat for detailed sub-task context.**
  ```md
  Parent issue: Product highlight PRD
  Sub-issue: Add featured section with badge details
  ```

- **Store the Linear API key as an environment variable so the Ralph CLI can read and update issues.**
  ```bash
  export LINEAR_API_KEY="your-api-key"
  ```

- **Update and reinstall the Ralph CLI when new integrations add extra binaries or flags.**
  ```bash
  bun install
  bun run build
  bun run install-cli
  ```

- **Configure Ralph for Linear by selecting the tracker, team, label filter, polling interval, and PR behavior.**
  ```toml
  tracker = "linear"
  linear_team = "SAP"
  linear_label = "agent-ralph"
  poll_interval = 30
  auto_create_pr = true
  ```

- **Forward `LINEAR_API_KEY` into yolobox because containerized agents do not automatically inherit host secrets.**
  ```toml
  [yolobox]
  env = ["LINEAR_API_KEY"]
  ```

- **A Linear PRD skill can create one parent issue and one child issue per implementation task.**
  ```md
  Parent: Highlight featured products
  Children:
  - Add featured flag
  - Render featured section
  - Add featured badge
  ```

- **Resolve the Linear team and backlog state through the API before creating issues.**
  ```js
  const team = await linear.getTeamByKey(config.linear_team);
  const backlog = await linear.getBacklogState(team.id);
  ```

- **Use a grilling or interview skill before PRD creation when feature requirements are still vague.**
  ```md
  Ask: What does highlighting a product mean to the user?
  Answer: A featured section at the top of the shop.
  ```

- **Mark approved Linear PRDs with the watched label and status so Ralph can pick them up automatically.**
  ```md
  Status: Todo
  Label: agent-ralph
  ```

- **Injecting a Linear CLI system prompt lets the agent manage issues without relying on local skill files.**
  ```bash
  claude --append-system-prompt "Use $RALPH_LINEAR to read and update Linear issues."
  ```

- **Have Ralph update Linear while it works so issue status, comments, labels, and completion stay in sync.**
  ```bash
  $RALPH_LINEAR issue update SAP-123 --status done
  $RALPH_LINEAR comment create SAP-123 "Opened pull request."
  ```

- **GitHub and Linear integrations close the loop when a generated pull request is merged.**
  ```md
  Ralph creates PR → GitHub detects merge → Linear issue moves to Done
  ```

## Episode 13 — Human In The Loop

- **Unattended AI loops drift when an ambiguous decision is wrong early and later tasks build on it.**
  ```md
  Ambiguous schema → wrong implementation → unusable feature
  ```

- **Use human-in-the-loop mode for important architectural choices that need review before the loop continues.**
  ```md
  [Human In The Loop] Define menu item customization data model
  ```

- **Ralph can detect a human-in-the-loop task title and pause the issue in review instead of marking it done.**
  ```md
  Child issue: In Review
  Parent issue: In Review
  ```

- **Add a hook for human-in-the-loop stops so you notice when Ralph needs manual review.**
  ```toml
  human_in_the_loop_hook = "afplay notification.mp3"
  ```

- **Mark only high-risk child issues for review so routine tasks can still run unattended.**
  ```md
  Parent: Add menu item add-ons and modifiers
  Review task: Define customization schema
  Routine task: Render selected options in cart
  ```

- **Review the model's proposal before downstream implementation work locks in the wrong structure.**
  ```md
  Feedback: options needs an id field.
  Type: unsigned integer.
  ```

- **Move the reviewed issue back to todo after commenting so Ralph can apply the feedback in the next loop.**
  ```md
  Comment added → status Todo → Ralph continues
  ```

- **Remove the human-in-the-loop marker when the decision is approved and another pause is unnecessary.**
  ```md
  Before: [Human In The Loop] Define customization schema
  After: Define customization schema
  ```

- **Small review feedback can prevent larger code problems, like using unstable names instead of IDs as keys.**
  ```vue
  <li v-for="option in customization.options" :key="option.id">
      {{ option.name }}
  </li>
  ```

- **Test the completed feature in the agent workspace before merging because the loop only proves implementation, not product fit.**
  ```bash
  yarn dev
  ```

## Episode 14 — Offloading Loops To A Remote Machine

- **Use a remote worker when Ralph should keep running on an always-on machine instead of your local laptop.**
  ```bash
  ssh Cloudbox
  tmux new -s laracasts_ralph
  cd ~/projects/view-shop
  ralph
  ```

- **Set up the remote machine like a real development environment because the agent runs there, not locally.**
  ```bash
  ralph --version
  export LINEAR_API_KEY="your-api-key"
  gh auth status
  ```

- **Use `tmux` as the persistence layer so the remote loop survives after you disconnect.**
  ```bash
  # Detach locally, then reconnect later
  tmux attach -t laracasts_ralph
  ```

- **Configure Ralph remote mode when you want the local CLI to dispatch work over SSH.**
  ```toml
  [remote]
  host = "Cloudbox"
  project_directory = "~/projects/view-shop"
  workspace_mode = "copy-on-write"
  workspace_directory = "laracasts"
  yolobox = true
  auto_create_pr = true
  ```

- **Dispatching through remote mode streams logs back locally while the actual headless agent runs inside remote `tmux`.**
  ```bash
  ralph --remote Cloudbox
  ```

- **Quitting the local control pane should detach from the remote loop, not kill the running agent.**
  ```md
  Press Q locally → detach from logs
  Remote tmux session → keeps working
  ```

- **Use a dedicated GitHub account for remote agents to separate human commits from agent commits.**
  ```bash
  gh auth login
  git config user.name "Cloudbox Agent"
  ```

- **Review remote-generated pull requests the same way you review local agent work before merging.**
  ```bash
  gh pr checkout 5
  yarn install
  yarn dev
  ```

## Episode 15 — Experimenting With A Perpetual Loop

- **A complete hook can turn Ralph from a finite loop into a perpetual system by starting follow-up work after a run finishes.**
  ```md
  Loop finished → merge open PR → plan next feature → start next loop
  ```

- **Keep post-loop actions small by assigning one agent to merge finished work and another to plan the next feature.**
  ```md
  Complete hook:
  1. Merge the open pull request
  2. Run the next-feature skill
  ```

- **The `next-feature` skill should read completed work and the product vision before choosing the next task.**
  ```md
  Read Linear done issues
  Read vision.md
  Create the next Linear issue
  ```

- **A vision document gives autonomous agents a north star so they do not invent random product direction.**
  ```md
  Goal: multi-tenant food ordering platform
  Tech stack: Laravel, Inertia React, SQLite, built-in auth
  ```

- **Put guardrails in place before the loop starts because autonomous agents compound early mistakes quickly.**
  ```md
  Manual scaffold: laravel new
  Browser skill: enabled
  yolobox fragment: browser dependencies
  Stop hook: test gate
  ```

- **A stop hook should make failed tests block progress so unattended agents cannot quietly move on.**
  ```bash
  php artisan test --compact
  ```

- **Browser verification matters for autonomous UI work because a green test suite can still miss visual glitches.**
  ```md
  Kitchen display → mark ready → refresh needed
  Operating hours → overlapping slot allowed
  ```

- **Check secret storage manually because generated settings screens can accidentally persist plaintext credentials.**
  ```sql
  SELECT stripe_secret FROM tenants LIMIT 1;
  -- Should be encrypted, not sk_test_...
  ```

- **Polling can prove an order-status flow, but production notifications usually need a stronger real-time path.**
  ```md
  Prototype: poll for notifications
  Production: websockets or another realtime channel
  ```

- **Autonomous PRs can create a working prototype, but large generated diffs are too risky to trust without careful review.**
  ```md
  30 pull requests
  31,881 additions
  300+ files
  Ship to production: no
  ```
