import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('====================================================');
console.log('🚀 Starting Ework Workspace in VS Code...');
console.log('   - Backend API & SQLite:  http://localhost:5000');
console.log('   - Admin Web Dashboard:   http://localhost:5173');
console.log('====================================================\n');

function runService(name, cwd, command, args, colorCode) {
  const reset = '\x1b[0m';
  const color = `\x1b[${colorCode}m`;
  const prefix = `${color}[${name}]${reset} `;

  const cmdString = `${command} ${args.join(' ')}`;
  const proc = spawn(cmdString, [], {
    cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
    stdio: ['inherit', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) console.log(prefix + line);
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) console.error(prefix + line);
    });
  });

  proc.on('close', (code) => {
    console.log(`${prefix}Process exited with code ${code}`);
  });

  return proc;
}

const backendProc = runService(
  'Backend',
  path.join(rootDir, 'backend'),
  'node',
  ['--experimental-sqlite', 'src/server.js'],
  '36' // Cyan
);

const dashboardProc = runService(
  'Dashboard',
  path.join(rootDir, 'admin_dashboard'),
  npmCmd,
  ['run', 'dev'],
  '32' // Green
);

function shutdown() {
  console.log('\n🛑 Shutting down Ework services...');
  try {
    if (backendProc && !backendProc.killed) backendProc.kill('SIGINT');
    if (dashboardProc && !dashboardProc.killed) dashboardProc.kill('SIGINT');
  } catch (_) {}
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
