/**
 * Web Terminal
 *
 * This server contains the interface for running commands
 * on lab environments via web sockets
 */

const http = require('http');
const os = require('os');
const pty = require('node-pty');

const server = http.createServer().listen(5000);

const io = require('socket.io')(server, {
  cors: {
    origin: [
      'http://localhost:4200',
      'https://university-dev.dynatracelabs.com',
      'https://university-staging.dynatracelabs.com',
      'https://university.dynatrace.com',
    ],
    methods: 'GET,POST',
    credentials: true,
  },
  path: process.env.TERMINAL_PATH ?? '/interface',
});

io.on('connection', (socket) => {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const terminal = pty.spawn(shell, [], {
    name: 'xterm',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  terminal.onData((data) => socket.emit('dtu-output', data));
  socket.on('dtu-input', (data) => terminal.write(data));
  socket.on('dtu-resize', (size) => terminal.resize(size.cols, size.rows));
  socket.on('disconnect', () => terminal.destroy());
});
