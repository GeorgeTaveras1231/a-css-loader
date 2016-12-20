module.exports = function createImportedName (importedName, path) {
  return JSON.stringify({
    type: 'imported-item',
    name: importedName,
    path: path
  });
}

