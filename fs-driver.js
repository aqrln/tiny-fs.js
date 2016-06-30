var fs = require('fs');

const FILENAME_SIZE = 256;
const MAX_LINKS = 2048;
const MAX_NODES = 1024;
const NODE_SIZE = 1024;
const BLOCK_SIZE = 4096;
const MAX_BLOCKS = 8192;

const SIZE_BYTES = 2;

const LINKS_TABLE_SIZE = MAX_LINKS * (FILENAME_SIZE + SIZE_BYTES);
const NODES_TABLE_SIZE = NODE_SIZE * MAX_NODES;
const BLOCKS_MAP_SIZE = MAX_BLOCKS / 8;
const BLOCKS_POOL_SIZE = MAX_BLOCKS * BLOCK_SIZE;

var imageFd = null;

// Mount a filesystem
//
function mount(filename) {
  imageFd = fs.openSync(filename, 'r+');
}

// Unmount a filesystem
//
function umount() {
  fs.closeSync(imageFd);
  imageFd = null;
}

// Create a filesystem
//
function mkfs(filename) {
  var fd = fs.openSync(filename, 'w');

  var image = Buffer.alloc(LINKS_TABLE_SIZE + NODES_TABLE_SIZE +
    BLOCKS_MAP_SIZE + BLOCKS_POOL_SIZE);
  fs.writeSync(fd, image, 0, image.length);

  fs.closeSync(fd);
}

// Get info about an FS node
//
function filestat(id) {
  // TODO
}

// List links
//
function ls() {
  var linksTable = Buffer.alloc(LINKS_TABLE_SIZE);
  fs.readSync(imageFd, linksTable, 0, linksTable.length, 0);

  var links = {};

  for (var i = 0; i < MAX_LINKS; i++) {
    var offset = i * (FILENAME_SIZE + SIZE_BYTES);
    if (linksTable.readUInt8(offset) === 0) continue;
    var fname = linksTable.toString('utf-8', offset, FILENAME_SIZE).replace('\u0000', '');
    var id = linksTable.readUInt16LE(offset + FILENAME_SIZE);
    links[fname] = id;
  }

  return links;
}

// Create a new file
//
function create(name) {
  // TODO
}

// Open a file
//
function open(name) {
  // TODO
}

// Close a file
//
function close(fd) {
  // TODO
}

// Read data from a file
//
function read(fd, offset, size) {
  // TODO
}

// Write data to a file
//
function write(fd, offset, size, data) {
  // TODO
}

// Create a new link
//
function link(oldName, newName) {
  // TODO
}

// Remove a link
//
function unlink(name) {
  // TODO
}

// Change the size of a file
//
function truncate(name, size) {
  // TODO
}

module.exports = {
  mount, umount, filestat, ls, create, open, close,
  read, write, link, unlink, truncate, mkfs
};
