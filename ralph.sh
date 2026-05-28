#!/bin/bash
iterations=${1:-10}

for i in $(seq 1 "$iterations"); do
    echo "--- Iteration $i ---"
    result=$(opencode run "$(cat prompt.md)")
    echo "$result"
    if [[ "$result" == *"ALL_TASKS_COMPLETE"* ]]; then
        echo "All tasks are complete."
        break
    fi
done
