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
        try{
        this.addBatterySlot(new BatterySlot(msg.payload));
        this.node.status({fill:"green",shape:"dot",text:"Working fine. In bucket "+this.batterySlots.length});
        }catch(error){
            this.node.status({fill:"red",shape:"dot",text:error});
            throw error;
        }
        let oVal={payload:{

        }};
        if(this.isConsolidable()===true){
            oVal.payload=this.get();
            send(oVal);
            this.batterySlots=new Array<BatterySlot>();
            this.consolidable=false;
            this.setDuration(Number(this.config.mainBucketDuration));
        }else{
            
        }
    }


    writeOnContext(){
        this.context.set("balanceNeto",JSON.stringify(this.get()));
    }

    readFromContext(){
        if(this.context.get("balanceNeto")!==undefined){
            let payloadSer=JSON.parse(this.context.get("balanceNeto"));
            let oval=payloadSer;
            this.of(oval);
            }
    }

}