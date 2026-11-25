const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[33m%s\x1b[0m', '═══════════════════════════════════════════════════════');
console.log('\x1b[33m%s\x1b[0m', '  🎬 CineBook — Launching Full Stack Cinema Platform   ');
console.log('\x1b[33m%s\x1b[0m', '═══════════════════════════════════════════════════════');

// Start Backend API (Port 5001)
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Start Frontend Client (Port 5173)
const client = spawn('npx', ['vite', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

const cleanExit = () => {
  console.log('\n\x1b[31m%s\x1b[0m', 'Shutting down CineBook services...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);
