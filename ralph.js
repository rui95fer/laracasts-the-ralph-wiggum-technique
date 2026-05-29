import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const iterations = parseInt(process.argv[2] || '10', 10);
const prompt = readFileSync('prompt.md', 'utf-8').trim();

function formatToolCall(part) {
    const tool = part.tool;
    const input = part.state?.input || {};

    if (tool === 'read') {
        return `📖 Read: ${input.filePath}`;
    }

    if (tool === 'bash') {
        return `💻 Run: ${input.command}`;
    }

    if (tool === 'edit') {
        return `✏️  Edit: ${input.filePath}`;
    }

    if (tool === 'write') {
        return `📝 Write: ${input.filePath}`;
    }

    return `🔧 ${tool}: ${JSON.stringify(input)}`;
}

function formatToolResult(part) {
    const status = part.state?.status;
    const output = part.state?.output || '';

    if (status === 'error') {
        return `❌ Error: ${output.slice(0, 200)}`;
    }

    const preview = output.replace(/\s+/g, ' ').trim().slice(0, 150);
    return preview ? `✅ ${preview}...` : '✅ Done';
}

function processLine(line) {
    let event;
    try {
        event = JSON.parse(line);
    } catch {
        return null;
    }

    const { type, part } = event;

    if (type === 'tool_use') {
        console.log(`  ${formatToolCall(part)}`);
        if (part.state?.output) {
            console.log(`  ↳ ${formatToolResult(part)}`);
        }
    }

    if (type === 'text') {
        const text = part.text || '';
        console.log(`\n${text}\n`);
        return text;
    }

    if (type === 'step_finish') {
        const tokens = part.tokens?.total || 0;
        const cost = part.cost || 0;
        console.log(`  ⏱  ${tokens} tokens | $${cost.toFixed(4)}`);
    }

    return null;
}

async function runIteration(i) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`  Iteration ${i}`);
    console.log(`${'─'.repeat(50)}`);

    return new Promise((resolve) => {
        const child = spawn(
            `opencode run --format "json" ${JSON.stringify(prompt)}`,
            {
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true,
            },
        );

        let buffer = '';
        let fullText = '';

        child.stdout.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (line.trim()) {
                    const text = processLine(line);
                    if (text) fullText += text;
                }
            }
        });

        child.stderr.on('data', (chunk) => {
            const msg = chunk.toString().trim();
            if (msg) console.error(`  ⚠️  ${msg}`);
        });

        child.on('close', () => {
            if (buffer.trim()) {
                const text = processLine(buffer);
                if (text) fullText += text;
            }
            resolve(fullText);
        });
    });
}

async function main() {
    console.log('Ralph is running...');
    console.log(`Iterations: ${iterations}`);
    console.log(`Prompt: ${prompt.slice(0, 80)}...`);

    for (let i = 1; i <= iterations; i++) {
        const result = await runIteration(i);

        if (result.includes('ALL_TASKS_COMPLETE')) {
            console.log('\n✅ All tasks are complete.');
            break;
        }
    }
}

main();
