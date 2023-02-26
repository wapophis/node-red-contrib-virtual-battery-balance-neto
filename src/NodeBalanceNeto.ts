import {BalanceNeto} from "@virtualbat/entities/dist/src/BalanceNeto.js";
import { BatterySlot } from "@virtualbat/entities/dist/src/BatterySlot";

export type NodeBalanceNetoConfig={
    mainBucketDuration:number,
    subBucketDuration:number
}

export type NodeInputMsg={
    payload:any,
    _msgid:string,
    parts:{id:string,index:number,count:number}
}

export class NodeBalanceNeto extends BalanceNeto{
    node:any;
    config:NodeBalanceNetoConfig;
    context:any;

    constructor(node:any,config:any,nodeContext:any){
        super(undefined);
        this.config=config;
        this.node=node;
        this.context=nodeContext;
        this.setDuration(Number(this.config.mainBucketDuration));
        node.log(JSON.stringify({event:"INIT",node:this.node,config:this.config}));
    }


    /**
     * Receives a message from a previous node and make main processs
     * @param msg 
     * @param send 
     * @param done 
     */
    onInput(msg:NodeInputMsg,send:any,done:any){
        this.node.log("INPUT RECEIVED");
        this.addBatterySlot(new BatterySlot(msg.payload));
    }


    writeOnContext(){

    }

    readFromContext(){

    }

}