# Another CSS Loader

> A css loader inspired by [webpack/css-loader](https://github.com/webpack/css-loader).

### Rationale
This loader is different than [webpack/css-loader](https://github.com/webpack/css-loader) in the following ways.

- Allows css-modules to be distributed and re-used as npm packages. (See webpack/css-loader#393)
- Includes css-modules/values by default

### Missing features

- Source maps
- @media queries on imports

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
@value my-special-color '#ff00ff';
@value another-special-color from './colors.css';

.my-class {
  composes: another from './another-css-file.css';
  color: my-special-color;
}
```

JS

```javascript
import { locals } from './my-css.css';

locals['my-special-color'] === '#ff00ff'; // true
locals['another-special-color'] === require('./colors.css').locals['another-special-color']; // true

locals['my-class'] === \
  require('./another-css-file.css').locals['another'] + ' my-class--1a1b2'; // true
```

### Options

| Name | Type | Description |
|------|-------------|-------|
| camelize | boolean | Wether to export camelized versions of the keys |
| scopedNameFormat | string | Format for class name. It leverages [this](https://github.com/webpack/loader-utils#interpolatename). |
| mode | enum | 'pure', 'global', or 'local' |
