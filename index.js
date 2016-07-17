require('babel-register')({
  presets: [
    'es2015',
    'react'
  ]
})

var Plugin = require('broccoli-plugin');
var path = require('path');
var fs = require('fs')
var mkdirp = require('mkdirp');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var glob = require('glob');


ReactStatic.prototype = Object.create(Plugin.prototype);
ReactStatic.prototype.constructor = ReactStatic;
function ReactStatic(inputNode, options) {
  options = options || {};

  if( !options.inputFile ) {
    throw new Error(`You must specify an input file`)
  }

  var fileName = path.parse(options.inputFile).name;
  if( !options.inputFile ) options.outputFile = fileName + '.html';


  if (!(this instanceof ReactStatic)) {
    return new ReactStatic(inputNode, options)
  }

  if (!!Array.isArray(inputNode)) {
    throw new Error(
      `Unexpected array for first argument
        - did you mean 'node' instead of ['node']?
      `
    )
  }

  var fileName = path.parse(options.inputFile).name;
  if( !options.inputFile ) options.outputFile = fileName + '.html';


  if (!(this instanceof ReactStatic)) {
    return new ReactStatic(inputNode, options)
  }

  Plugin.call(this, [inputNode], {
    annotation: options.annotation
  });

  this.inputNode = inputNode
  this.inputFile = options.inputFile
  this.outputFile = options.outputFile || fileName + '.html'
  this.options = options
}

ReactStatic.prototype.build = function() {

  var destFile = path.join(this.outputPath, this.outputFile)
  var srcFile = path.join(this.inputPaths[0], this.inputFile)

  console.log(this.inputNode);

  var Component = require(srcFile);
  var props = {};

  if( !!this.options.props ) props = this.options.props;

  if( Component.default ) Component = Component.default;

  mkdirp.sync(path.dirname(destFile))

  var html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Component, props)
  )

  fs.writeFileSync(destFile, '<!DOCTYPE html>' + html)

  /*
    Cache busting required React component
   */
  var cwd = path.dirname(srcFile);
  var cachedFiles = glob.sync('**', { cwd: cwd});
  var inputNode = this.inputNode;

  cachedFiles.forEach(function(file){
    console.log( path.join( path.resolve(inputNode), file)  )
    var key = path.join( path.resolve(inputNode), file);

    if( !path.extname(key) ){
      delete require.cache[path.join(key, 'index.js')];
      delete require.cache[path.join(key, 'index.jsx')];
    } else {
      delete require.cache[key];
    }
  });
};

module.exports = ReactStatic;
