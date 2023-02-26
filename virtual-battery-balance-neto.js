const { LocalDate } = require("@js-joda/core");
const List = require("collections/list");
const LocalDateTime= require("@js-joda/core").LocalDateTime;
const NodeBalanceNeto=require("./build/NodeBalanceNeto.js");


module.exports = function(RED) {
    

    function VirtualBatteryBalanceNetoNode(config) {
        
        var balance=null;
      
        var node;
        var nodeContext;

        RED.nodes.createNode(this,config);
        node=this;
        nodeContext= this.context();
        var nodeBalanceNeto=new NodeBalanceNeto.NodeBalanceNeto(node,config,nodeContext);

        nodeBalanceNeto.readFromContext();

        this.on('close', function() {
            nodeBalanceNeto.writeOnContext();
           });
        
        node.on('input',function(msg, send, done){
            nodeBalanceNeto.onInput(msg,send,done);
         
        });
    }    

   
    RED.nodes.registerType("virtual-battery-balance-neto",VirtualBatteryBalanceNetoNode);
}