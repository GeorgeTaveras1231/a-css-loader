# Another CSS Loader

> A css loader inspired by [webpack/css-loader](https://github.com/webpack/css-loader).

### Rationale
This loader is different than [webpack/css-loader](https://github.com/webpack/css-loader) in the following ways.

- Allows css-modules to be distributed and re-used as npm packages. (See [webpack/css-loader#393](https://github.com/webpack/css-loader/pull/393))
- Allows webpack to fully resolve all paths
- Support css-modules/value (@value syntax)

### TOC

- [Examples](./examples/)

### Missing features

- Source maps
- @media queries after @imports
- url() for @imports

## Usage

### Installation

```bash
$ npm install --save a-css-loader
```

### Example

***Webpack 1***

```javascript
// webpack.config.js

module.exports =  {
  module: {
    /* ... Omitted */
    loaders: [
      {
        test: /\.css$/,
        loader: 'a-css-loader',
        query: {
          /* These are the defaults */
          camelize: false,
          scopedNameFormat: '[local]--[hash:5]',
          mode: 'pure'
        }
      }
    ]
  }
};
```

CSS

```css
/* @import will combine the css of imported files*/
@import './a-css-file';
/* @require are just an alias for @import.
They are useful when combining this loader with the sass loader because they allow you to bypass
sass's own @import
*/
@require './another-css-file';

/* These variables will be stored and exported as locals */
@value my-special-color '#ff00ff';
@value another-special-color from './colors.css';


.my-class {
  composes: another from './another-css-file.css';
  color: my-special-color;
}
```

JS

```javascript
import cssModule from './my-css.css';

cssModule['my-special-color'] === '#ff00ff'; // true
cssModule['another-special-color'] === require('./colors.css')['another-special-color']; // true

cssModule['my-class'] === require('./another-css-file.css')['another'] + ' my-class--1a1b2'; // true
```

### Path resolution

By default, most path references are resolved by webpack. The only exception is in `url()`
functions. To force them to use webpack to resolve the path, prepend the path with a `~`.

Example:
```css
.my-class {
  background: url('http://not-resolved-by-webpack.com/image')
}

.my-other-class {
  background: url('~./path/resolved/by/webpack')
}
```

### Options

| Name | Type | Description |
|------|-------------|-------|
| camelize | boolean | Whether to export camelized versions of the keys |
| reduceIdents | boolean | Whether to minify @ rules names |
| scopedNameFormat | string | Format for class name. It leverages [this](https://github.com/webpack/loader-utils#interpolatename). |
| mode | enum | 'pure', 'global', or 'local' |
