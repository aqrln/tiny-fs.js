var fs = require('fs');

function mount(filename) {
  // TODO
}

function umount() {
  // TODO
}

function filestat(id) {
  // TODO
}

function ls() {
  // TODO
}

function create(name) {
  // TODO
}

function open(name) {
  // TODO
}

function close(fd) {
  // TODO
}

function read(fd, offset, size) {
  // TODO
}

function write(fd, offset, size, data) {
  // TODO
}

function link(oldName, newName) {
  // TODO
}

function unlink(name) {
  // TODO
}

function truncate(name, size) {
  // TODO
}

module.exports = {
  mount, umount, filestat, ls, create, open, close,
  read, write, link, unlink, truncate
};
