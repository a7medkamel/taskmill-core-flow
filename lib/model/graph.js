"use strict";

var Promise               = require('bluebird')
  , _                     = require('lodash')
  , dot                   = require('dotparser')
  ;

// http://www4.ncsu.edu/~ithaywoo/Chapter5.pdf
// http://webwhompers.com/graph-theory.html
class Graph {
  constructor(text_or_dot) {
    if (_.isString(text_or_dot)) {
      this.text = text_or_dot;
      this.dot = dot(text_or_dot);
    }

    if (_.isObject(text_or_dot)) {
      this.dot = text_or_dot;
    }
  }

  root() {
    let edges = Graph.edges(this.dot)
      , fs    = _.chain(edges).map((e) => e.f).uniq().value()
      , ts    = _.chain(edges).map((e) => e.t).uniq().value()
      , root  = _.without(fs, ...ts);
      ;

    if (_.size(root) > 1) {
      return undefined;
    }

    return root[0];
  }

  next(id) {
    let edges = Graph.edges(this.dot)
      , nexts = _.chain(edges).filter((e) => e.f == id).map((e) => e.t).value()
      ;

    return nexts;
  }

  edges() {
    return Graph.edges(this.dot);
  }

  static edges(obj) {
    return _.chain(Graph.stmt(obj))
            .map((stmt) => {
              let list = stmt.edge_list;

              return _.reduce(list, (a, n, i) => {
                        if (i > 0) {
                          a.push({ f : list[i-1].id, t: n.id });
                        }

                        return a;
                      }, []);
            })
            .flatten()
            .value();
  }

  static stmt(obj) {
    return _.chain(obj)
            .first()
            .get('children')
            .value();
  }
}

module.exports = Graph;
