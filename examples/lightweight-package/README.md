# Lightweight package

> This is an example of a best practice when creating css-module packages

### Inspiration

One of the reasons why I created a-css-loader was to enable the creation of npm packages that encapsulate css-modules. Each css-module has a dependency on `css-module-builder` which is ~ 130 lines of code. In a complex application that has N css-module dependencies means `css-modules-builder` will be bundled N times by default.
See #(issue).

### Setup

```
$ npm install
```

### Build

```
$ npm run build
```

### Configuration

The most important configuration is the `externals` configuration in `webpack.config.js`.

### Result

`build/application.js` file will exclude `css-module-builder` from the bundle.
