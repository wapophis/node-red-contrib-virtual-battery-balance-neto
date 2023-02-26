const { LocalDate } = require("@js-joda/core");
const List = require("collections/list");
const LocalDateTime= require("@js-joda/core").LocalDateTime;
const NodeBalanceNetoHorario=require("./build/NodeBalanceNeto.js");


module.exports = function(RED) {
    

    function VirtualBatteryBalanceNetoHorarioNode(config) {
        
        var balance=null;
      
        var node;
        var nodeContext;

        RED.nodes.createNode(this,config);
        node=this;
        nodeContext= this.context();
        var nodeBalanceNetoHorario=new NodeBalanceNetoHorario.NodeBalanceNetoHorario(node,config);
        nodeBalanceNetoHorario.setNodeContext(nodeContext);

        node.log("INIT");

        nodeBalanceNetoHorario.unSerialize();

        this.on('close', function() {
            nodeBalanceNetoHorario.serialize();
           });
        
        node.on('input',function(msg, send, done){
            nodeBalanceNetoHorario.onInput(msg,send,done);
         
        });
    }    

   
    RED.nodes.registerType("virtual-battery-balance-neto-horario",VirtualBatteryBalanceNetoHorarioNode);
}