"use strict";

var Promise               = require('bluebird')
  , _                     = require('lodash')
  ;

class Path {
  constructor(data) {
    this.__data = _.isString(data)? JSON.parse(data) : data;
  }

  leaf() {
    return _.chain(this.__data).last().last().value();
  }

  concat(id) {
    let leaf = this.leaf()
      , data = _.concat(this.__data, [[leaf, id]])
      ;

    return data;
  }

  data() {
    return this.__data;
  }

  // static parse(str) {
  //   let regex = /\(([A-Za-z0-9_.-]+),([A-Za-z0-9_.-]+)\)/g
  //     , edges = []
  //     , m     = undefined
  //     ;
  //
  //   while ((m = regex.exec(str)) !== null) {
  //     // This is necessary to avoid infinite loops with zero-width matches
  //     if (m.index === regex.lastIndex) {
  //       regex.lastIndex++;
  //     }
  //
  //     edges.push({ f : m[1], t : m[2] });
  //   }
  //
  //   return edges;
  // }
}

module.exports = Path;
