"use strict";

var Promise       = require('bluebird')
  , request       = require('request')
  , _             = require('lodash')
  , git           = require('taskmill-core-git')
  , codedb_sdk    = require('taskmill-core-codedb-sdk')
  , Graph         = require('./graph')
  , Path          = require('./path')
  ;

class Document {
  constructor(blob) {
    let text    = blob.content
      , options = blob.markdown.options
      , remote  = blob.repository.remote
      , { ast, block, branch } = blob
      ;

    this.remote = remote;

    this.ast = ast;
    this.block = block;
    this.branch = branch;

    this.blob = blob;
    // this.text = text;
  }

  graph(options = {}) {
    return Promise
            .try(() => {
              // 1.1 extract graph from markdown
              return _.find(this.ast, o => o.type == 'code' && o.lang == 'dot')
            })
            .then((block) => {
              if (!block) {
                throw new Error('graph not found');
              }

              return block.text;
            })
            .then((text) => {
              return new Graph(text);
            });
  }

  vertex(id) {
    return _.chain(this.block)
            .find((b) => {
              let pragma = _.get(b.manual, 'pragma');

              // todo [akamel] this is strict lookup (spaces will mess it up)
              // todo [akamel] rename flow to something else
              return _.includes(pragma, `flow ${id}`)
            })
            .value();
  }

  open(p) {
    let path    = new Path(p)
      , vertex  = this.vertex(path.leaf());

    let remote    = git.remote(this.remote)
      , platform  = git.get_platform(remote.hostname)
      ;

    let filename = git.stringify(platform, remote.username, remote.repo, this.blob.path, { branch : this.branch });
    let pathname = git.stringify(platform, remote.username, remote.repo, '$.js', { branch : this.branch });
    // let path = [];
    // todo [akamel] set gateway url correctly
    let uri     = 'http://localhost:8070/github.com' + pathname
      , cb_uri  = `http://localhost:8030/progress/${remote.hostname}${filename}/${JSON.stringify(p)}/1234`
      ;

    // console.log(uri, cb_uri, remote, platform, vertex, path.leaf(), path.data());

    return request({
        method : 'POST'
      , uri
      , headers : {
          blob : (new Buffer(vertex.text)).toString('base64')
        , pipe : cb_uri
      }
    });
    // todo [akamel] opens the vertex's endpoint
    // return process.stdout;
  }

  static find(pathname, options = {}) {
    return Promise
            .try(() => {
              return git.parse(undefined, pathname);
            })
            .then((info) => {
              // 1. get document text
              let { remote, branch, filename } = info
                , { bearer } = options
                ;

              return codedb_sdk.blob(remote, filename, { branch, bearer, populate : { block : true, ast : true, manual : true } });
            })
            .then((blob) => {
              return new Document(blob);
            });
  }
}

module.exports = Document;
