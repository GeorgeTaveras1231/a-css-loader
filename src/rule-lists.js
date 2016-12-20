function normalizeExports (exportedSymbolsAsString) {
  return exportedSymbolsAsString.split(' ').map((symbol) => {
    if (symbol[0] === '{') {
      return JSON.parse(symbol);
    }

    return {
      type: 'local',
      name: symbol
    };
  });
}

exports.Imports = class Imports {
  constructor() {
    this.declarations = [];
    this.urls = new Set();

    this.eachDeclaration = this.declarations.forEach.bind(this.declarations);
    this.map = this.declarations.map.bind(this.declarations);
  }

  add(rule) {
    rule.walkDecls((declaration) => {
      const importMeta = JSON.parse(declaration.prop)
      this.urls.add(importMeta.path);
      this.declarations.push(importMeta);
    });
  }
}


exports.Exports = class Exports {
  constructor() {
    this.declarations = [];
    this.forEach = this.declarations.forEach.bind(this.declarations);
  }

  add(rule) {
    rule.walkDecls((declaration) => {
      this.declarations.push({
        name: declaration.prop, value: normalizeExports(declaration.value)
      });
    });
  }
}

