var readline = require('readline');
var fsDriver = require('./fs-driver');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line) => {
    var completions = [
      'mount', 'umount', 'filestat', 'ls', 'create', 'open', 'close',
      'read', 'write', 'link', 'unlink', 'truncate', 'echo', 'exit',
      'mkfs'
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

  mkfs: (filename) => {
    fsDriver.mkfs(filename);
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
    var files = fsDriver.ls();
    for (var name in files) {
      console.log(`${name}: ${files[name]}`);
    }
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
    rl.question('Data: ', (data) => {
      //
      rl.prompt();
    });
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
      try {
        command.apply(commands, argv.slice(1));
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log('Unknown command');
    }
  }

  rl.prompt();
});

rl.prompt();
