var assert    = require('chai').should()
  , dot       = require('./data/dot.json')
  , Graph     = require('../lib/model/graph')
  ;

describe('graph', () => {
  describe('om', () => {
    it('should return next node ["c", "d"] if given node "b"', () => {
      let next = (new Graph(dot)).next('b');

      next.should.deep.equal([ 'c', 'd' ]);
    });

    it('should return next node ["b", "e", "c"] if given node "a"', () => {
      let next = (new Graph(dot)).next('a');

      next.should.deep.equal([ 'b', 'e', 'c' ]);
    });

    it('should return root "a"', () => {
      let root = (new Graph(dot)).root();
      root.should.deep.equal('a');
    });

    it('should return edges', () => {
      let edges = Graph.edges(dot);

      edges.should.deep.equal([
          { f: 'a', t: 'b' },
          { f: 'b', t: 'c' },
          { f: 'c', t: 'a0' },
          { f: 'b', t: 'd' },
          { f: 'c', t: 'd' },
          { f: 'a', t: 'e' },
          { f: 'a', t: 'c' }
      ]);
    });
  });
});
