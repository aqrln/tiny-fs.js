var readline = require('readline');
var fsDriver = require('./fs-driver');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line) => {
    var completions = [
      'mount', 'umount', 'filestat', 'ls', 'create', 'open', 'close',
      'read', 'write', 'link', 'unlink', 'truncate', 'echo', 'exit',
    ];
    var hints = completions.filter(c => c.startsWith(line));
    return [hints.length ? hints : completions, line];
  }
});

rl.setPrompt('\n> ');

var commands = {
  echo: (...args) => {
    console.log(args.join(' '));
  },

  exit: () => {
    rl.close();
    process.exit(0);
  },

  mount: (filename) => {
    fsDriver.mount(filename);
  },

  umount: () => {
    fsDriver.umount();
  },

  filestat: (id) => {
  },

  ls: () => {
  },

  create: (name) => {
  },

  open: (name) => {
  },

  close: (fd) => {
  },

  read: (fd, offset, size) => {
  },

  write: (fd, offset, size) => {
    rl.pause();
    var data = process.stdin.read(10);
    console.log(data.toString());
    rl.resume();
  },

  link: (oldName, newName) => {
  },

  unlink: (name) => {
  },

  truncate: (name, size) => {
  }
};

rl.on('line', (input) => {
  var argv = input.split(' ');

  if (argv.length > 0) {
    var command = commands[argv[0]];
    if (command) {
      command.apply(commands, argv.slice(1));
    } else {
      console.log('Unknown command');
    }
  }

  rl.prompt();
});

rl.prompt();
