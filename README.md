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
