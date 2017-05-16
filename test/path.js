var assert    = require('chai').should()
  , Path      = require('../lib/model/path')
  ;

describe('path', () => {
  describe('om', () => {
    it('should return 3 nodes called "a", "b", "c"', () => {
      // let res = Path.parse('((a,b),(b,c),(c,d))');
      let res = new Path('[["a","b"],["b","c"],["c","d"]]').data();

      res.should.deep.equal([ [ 'a', 'b' ], [ 'b', 'c' ], [ 'c', 'd' ] ]);
    });

    it('should return leaf "d"', () => {
      let res = new Path('[["a","b"],["b","c"],["c","d"]]').leaf();

      res.should.deep.equal('d');
    });
  });
});
