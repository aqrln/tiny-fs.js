const readline = require('readline');
const fsDriver = require('./fs-driver');

const rl = readline.createInterface({
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
    var stat = fsDriver.filestat(+id);
    console.log('Stats for node', id);
    console.log('Active links:', stat.activeLinks);
    console.log('Blocks count:', stat.blocks.length);
    console.log('Block list:', stat.blocks.join(', '));
  },

  ls: () => {
    var files = fsDriver.ls();
    for (var name in files) {
      console.log(`${name}: ${files[name]}`);
    }
  },

  create: (name) => {
    fsDriver.create(name);
  },

  open: (name) => {
    console.log(fsDriver.open(name));
  },

  close: (fd) => {
    fsDriver.close(+fd);
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
    fsDriver.link(oldName, newName);
  },

  unlink: (name) => {
    fsDriver.unlink(name);
  },

  truncate: (name, size) => {
    fsDriver.truncate(name, +size);
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
