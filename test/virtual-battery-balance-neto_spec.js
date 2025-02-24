var should = require("should");
var helper = require("node-red-node-test-helper");
var balanceNetoNode = require("../virtual-battery-balance-neto.js");

helper.init(require.resolve('node-red'));

describe('virtual-battery-balance-neto Node', function () {

  beforeEach(function (done) {
      helper.startServer(done);
  });

  afterEach(function (done) {
      helper.unload();
      helper.stopServer(done);
  });

   it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "virtual-battery-balance-neto", mainBucketDuration: 60,subBucketDuration:5,incomingSlotsReadingTimeStampOffset:1 }];
    helper.load(balanceNetoNode, flow, function () {
      var n1 = helper.getNode("n1");
      try {
        n1.warn.should.be.calledWithExactly("baddly")
        done();
      } catch(err) {
        done(err);
      }
    });
  }); 

  it('should make payload lower case', function (done) {
    
    var flow = [
      { id: "n1", type: "virtual-battery-balance-neto",wires:[["n2"]],mainBucketDuration: 60,subBucketDuration:5,incomingSlotsReadingTimeStampOffset:1 },
      { id: "n2", type: "helper" }
    ];

    helper.load(balanceNetoNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      //n1.receive( {"payload":{"readTimeStamp":"2025-02-23T14:50:23","length":300000,"producedInWatsH":5354,"feededInWatsH":4881,"consumedInWatsH":473}} );
      n1.receive({payload:getSlot()});
      n2.on("input", function (msg) {
        try {
          msg.should.have.property('payload', 'uppercase');
          done();
        } catch(err) {
          done(err);
        }
      });
   
    });
  
  });

  function getSlot(){
    return {
        "readTimeStamp":new Date().toISOString().slice(0,-5),
        "length":300000,
        "producedInWatsH":5354,
        "feededInWatsH":4881,
        "consumedInWatsH":473
    };
  }
});