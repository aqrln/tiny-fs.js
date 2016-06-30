var readline = require('readline');
var fsDriver = require('./fs-driver');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
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
    var data = process.stdin.read(10);
    console.log(data.toString());
  },

  link: (oldName, newName) => {
  },

  unlink: (name) => {
  },

  truncate: (name, size) => {
  }
};

rl.on('line', (input) => {
  console.log(input);
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
