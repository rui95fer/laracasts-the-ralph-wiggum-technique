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
