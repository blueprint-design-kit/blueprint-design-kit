'use server';

import { spawn } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';

import type { ChildProcess } from 'node:child_process';

/**
 * Ping the given URL until it responds, or timeout.
 */
export async function waitForServer(url: string, { timeoutMs = 60000, intervalMs = 1000 } = {}) {
    const start = Date.now();

    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const tryOnce = () => {
            const req = client.get(
            {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                timeout: intervalMs,
            },
            (res) => {
                // Consider any 2xx/3xx as "server is up"
                if (res.statusCode && res.statusCode < 400) {
                    res.resume(); // discard data
                    return resolve(true);
                }
                res.resume();
                scheduleNext();
            }
            );

            req.on('error', () => {
                scheduleNext();
            });

            req.on('timeout', () => {
                req.destroy();
                scheduleNext();
            });
        };

        const scheduleNext = () => {
            if (Date.now() - start > timeoutMs) {
                reject(new Error(`Timed out waiting for dev server at ${url}`));
            } else {
                setTimeout(tryOnce, intervalMs);
            }
        };

        tryOnce();
    });
}

/**
 * Start the dev server via `npm run dev` (or a custom command).
 * Returns the child process.
 */
export function startLocalServer(command: string, { cwd = process.cwd() } = {}) {
    if (!command) {
        throw new Error('A command is required to start the local server');
    }

    // Split: "npm run dev" -> const cmd = "npm"; const args = ["run","dev"]
    const [cmd = '', ...args] = command.split(' ');

    const child = spawn(cmd, args, {
        cwd,
        stdio: 'inherit', // show dev server logs
        env: {
            ...process.env,
        },
    });

    child.on('exit', (code, signal) => {
        console.log(`Dev server exited with code=${code} signal=${signal}`);
    });

    return child;
}

/**
 * Stop the dev server if we started it.
 */
export function stopLocalServer(child: ChildProcess | undefined) {
    if (!child || child.killed) return;

    // Try graceful shutdown first
    child.kill('SIGINT');

    // Fallback: force kill if still alive after a bit
    const timeout = setTimeout(() => {
        if (!child.killed) {
            child.kill('SIGKILL');
        }
    }, 5000);

    child.on('exit', () => clearTimeout(timeout));
}
