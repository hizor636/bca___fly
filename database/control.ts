import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const pgDataDir = path.join(projectRoot, 'database', 'data');
const logFile = path.join(pgDataDir, 'logfile');

// Find pg_ctl in standard Windows PostgreSQL 18 path or PATH
const pgCtl = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe';

const command = process.argv[2] || 'status';

if (command === 'start') {
  console.log(`Starting PostgreSQL cluster on port 5434 (${pgDataDir})...`);
  const res = spawnSync(pgCtl, ['-D', pgDataDir, '-l', logFile, 'start'], { stdio: 'inherit' });
  process.exit(res.status ?? 0);
} else if (command === 'stop') {
  console.log(`Stopping PostgreSQL cluster (${pgDataDir})...`);
  const res = spawnSync(pgCtl, ['-D', pgDataDir, 'stop'], { stdio: 'inherit' });
  process.exit(res.status ?? 0);
} else if (command === 'status') {
  const res = spawnSync(pgCtl, ['-D', pgDataDir, 'status'], { stdio: 'inherit' });
  process.exit(res.status ?? 0);
} else {
  console.log(`Unknown command: ${command}. Use 'start', 'stop', or 'status'.`);
  process.exit(1);
}
