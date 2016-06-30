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

const BLOCKS_MAP_OFFSET = LINKS_TABLE_SIZE + NODES_TABLE_SIZE;

var imageFd = null;

var blocksMap = new Uint8Array(BLOCKS_MAP_SIZE);

// Mount a filesystem
//
function mount(filename) {
  imageFd = fs.openSync(filename, 'r+');
  loadBlocksMap();
}

function loadBlocksMap() {
  var buffer = Buffer.from(blocksMap.buffer);
  fs.readSync(imageFd, buffer, 0, buffer.length, BLOCKS_MAP_OFFSET);
}

function saveBlocksMap() {
  var buffer = Buffer.from(blocksMap.buffer);
  fs.writeSync(imageFd, buffer, 0, buffer.length, BLOCKS_MAP_OFFSET);
}

// Unmount a filesystem
//
function umount() {
  fs.closeSync(imageFd);
  imageFd = null;
}

function markBlockFree(id) {
  var byte = id >> 3;
  var bit = id & 7;
  blocksMap[byte] &= ~(1 << bit);
}

function markBlockBusy(id) {
  var byte = id >> 3;
  var bit = id & 7;
  blocksMap[byte] |= 1 << bit;
}

function isBlockFree(id) {
  var byte = id >> 3;
  var bit = id & 7;
  return !(blocksMap[byte] & (1 << bit));
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
  var array = new Uint16Array(NODE_SIZE / 2);
  var buffer = Buffer.from(array.buffer);

  fs.readSync(imageFd, buffer, 0, buffer.length, LINKS_TABLE_SIZE + id * NODE_SIZE);

  return {
    activeLinks: array[0],
    blocks: Array.prototype.slice.call(array, 2, 2 + array[1])
  };
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
    var fname = linksTable.slice(offset, offset + FILENAME_SIZE).toString().replace(/\0/g, '');
    var id = linksTable.readUInt16LE(offset + FILENAME_SIZE);
    links[fname] = id;
  }

  return links;
}

// Create a new file
//
function create(name) {
  var files = ls();
  if (files[name] !== undefined) {
    throw new Error('file already exists');
  }

  for (var id = 0; id < MAX_NODES; id++) {
    var node = filestat(id);
    if (node.activeLinks === 0) {
      break;
    }
  }

  if (id === MAX_NODES) {
    throw new Error('filesystem limit exceeded');
  }

  node.activeLinks = 1;
  node.blocks = [];
  writeNode(id, node);

  files[name] = id;
  writeLinksTable(files);
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
  var files = ls();
  var id = files[oldName];

  if (id === undefined) {
    throw new Error('file not found');
  }

  files[newName] = id;
  writeLinksTable(files);

  var node = filestat(id);
  node.activeLinks++;
  writeNode(id, node);
}

function writeLinksTable(files) {
  var buffer = Buffer.alloc(LINKS_TABLE_SIZE);

  Object.keys(files).forEach((name, index) => {
    var id = files[name];
    var offset = index * (FILENAME_SIZE + SIZE_BYTES);

    buffer.write(name, offset);
    buffer.writeUInt16LE(id, offset + FILENAME_SIZE);
  });

  fs.writeSync(imageFd, buffer, 0, buffer.length, 0);
}

// Remove a link
//
function unlink(name) {
  var files = ls();
  var id = files[name];

  if (id === undefined) {
    throw new Error('file not found');
  }

  delete files[name];
  writeLinksTable(files);

  var node = filestat(id);
  node.activeLinks--;

  if (!node.activeLinks) {
    for (blockId of node.blocks) {
      markBlockFree(blockId);
    }
    saveBlocksMap();
  }

  writeNode(id, node);
}

function writeNode(id, node) {
  var array = new Uint16Array(NODE_SIZE / 2);
  var buffer = Buffer.from(array.buffer);

  array[0] = node.activeLinks;
  array[1] = node.blocks.length;
  for (var i = 0; i < node.blocks.length; i++) {
    array[2 + i] = node.blocks[i];
  }

  fs.writeSync(imageFd, buffer, 0, buffer.length, LINKS_TABLE_SIZE + id * NODE_SIZE);
}

// Change the size of a file
//
function truncate(name, size) {
  var files = ls();
  var id = files[name];
  if (id === undefined) {
    throw new Error('file not found');
  }

  var newBlocksCount = Math.ceil(size / BLOCK_SIZE);
  var node = filestat(id);
  
  if (newBlocksCount === node.blocks.length) {
    return;
  }

  while (newBlocksCount < node.blocks.length) {
    var blockId = node.blocks.pop();
    markBlockFree(blockId);
  }

  while (newBlocksCount > node.blocks.length) {
    var blockId = allocateBlock();
    node.blocks.push(blockId);
  }

  saveBlocksMap();
  writeNode(id, node);
}

function allocateBlock() {
  for (var i = 0; i < MAX_BLOCKS; i++) {
    if (isBlockFree(i)) {
      markBlockBusy(i);
      return i;
    }
  }
  throw new Error('no free blocks left on device');
}

module.exports = {
  mount, umount, filestat, ls, create, open, close,
  read, write, link, unlink, truncate, mkfs
};
