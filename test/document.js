var assert    = require('chai').should()
  , blob      = require('./data/blob.json')
  , Document  = require('../lib/model/document')
  ;

describe('document', () => {
  describe('om', () => {
    it('should return correct vertex b if given node "b"', () => {
      let vertex = (new Document(blob)).vertex('b');

      vertex.should.deep.equal({
        type: 'js',
        text: '/*\n  @pragma flow b\n*/\nmodule.exports = (req, res) => res.send(req.body + \'b\');',
        manual: { pragma: [ 'flow b' ] }
      });
    });

  });
});
