"use strict";

var Promise       = require('bluebird')
  , express       = require('express')
  , winston       = require('winston')
  , _             = require('lodash')
  , cors          = require('cors')
  , responseTime  = require('response-time')
  , config        = require('config-url')
  , morgan        = require('morgan')
  , devnull       = require('dev-null')
  , onFinished    = require('on-finished')
  , account_sdk   = require('taskmill-core-account-sdk')
  , Document      = require('./model/document')
  , Path          = require('./model/path')
  ;

var app = express();

app.use(responseTime());
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => {
  res.end();
});

// trigger flow
app.all(/flow(\/.*)/, (req, res, next) => {
  let r = req.params[0];

  account_sdk
    .issueTokenByUsername('github.com', 'a7medkamel')
    .then((jwt) => {
      let bearer = `Bearer ${jwt}`;
      // req.get('Authorization')
      return Document
        .find(r, { bearer })
        .then((document) => {
          return document
          .graph()
          .then((graph) => {
            // 2. find root vertex
            let root = graph.root();
            if (!root) {
              throw new Error(`graph root not found`);
            }

            let path = new Path([['0', root]])
              , next = graph.next(path.leaf())
              , out  = document.open(path.data(), { bearer })
              , sink = devnull()
              ;

            // sink = process.stdout;
            // 3. trigger root
            // req.pipe(out).pipe(sink);

            // 4. return run id
            return Promise
            .fromCallback((cb) => onFinished(out, cb))
            .then(() => {
              // todo [akamel] set correct id
              return { id : 1234 };
            });
          });
        })
        .then((result) => {
          res.send(result);
        })
        .catch(next);
    })
});

// move flow forward
app.all(/progress(\/.*)\/(.*)\/(.*)/, (req, res, next) => {
  let r     = req.params[0]
    , p     = req.params[1]
    , id    = req.params[2]
    ;

  // ex: a -> b, b -> c, a -> c
  // 1. /flow
  // 2. a
  // 3. /progress/.../[(0, 'a')]
  // 4.1 b
  // 4.2 c
  // 5.1 /progress/.../[(0, 'a'), ('a', 'b')]
  // 5.2 /progress/.../[(0, 'a'), ('a', 'c')]
  // 6.1 c
  // 7.1 /progress/.../[(0, 'a'), ('a', 'b'), ('b', 'c')]
  account_sdk
    .issueTokenByUsername('github.com', 'a7medkamel')
    .then((jwt) => {
      let bearer = `Bearer ${jwt}`;

      return Document
        .find(r, { bearer })
        .then((document) => {
          return document
                  .graph()
                  .then((graph) => {
                    let path = new Path(p)
                      , next = graph.next(path.leaf())
                      ;

                    if (!_.size(next)) {
                      req.pipe(process.stdout);
                      return;
                    }

                    let ret = _.map(next, (v) => {
                      let pn    = path.concat(v)
                        , out   = document.open(pn, { bearer })
                        , sink  = devnull()
                        ;

                      // sink = process.stdout;
                      // req.pipe(out).pipe(sink);
                      // req.pipe(process.stderr);
                      // req.write()
                      return Promise
                              .fromCallback((cb) => onFinished(out, cb));
                    });

                    return Promise.all(ret);
                  });
        })
        .then((result) => {
          res.send(result);
        })
        .catch(next);
    });
});

// generic err handler
app.use(function(err, req, res, next) {
  winston.error(err);
  res.status(500).send({ error : err.message });
});

function listen(options, cb) {
  return Promise.fromCallback((cb) => app.listen(options.port, cb)).asCallback(cb);
}

module.exports = {
    listen : listen
};
