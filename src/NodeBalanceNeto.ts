import {BalanceNeto, ResultSlot} from "@virtualbat/entities/dist/src/BalanceNeto.js";
import { BatterySlot } from "@virtualbat/entities/dist/src/BatterySlot";

export enum TimeUnits{
    MINUTE = "minutos",

}
export type NodeBalanceNetoConfig={
    mainBucketDuration:number,
    mainBucketChronoUnit:string,
    subBucketDuration:number,
    subBucketChronoUnit:string,
    incomingSlotsReadingTimeStampOffset:number
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
    currentSubBucketIndex:number=0;

    constructor(node:any,config:any,nodeContext:any){
        super(undefined);
        this.config=config;
        this.node=node;
        this.context=nodeContext;
        try{
        this.readFromContext();
        }catch(e){
            node.error(e);
        }
        
        this.setDuration(Number(this.config.mainBucketDuration),BalanceNeto.getDurationChronoUnit(this.config.mainBucketChronoUnit));
        this.setSlotOffset(Number(this.config.incomingSlotsReadingTimeStampOffset));
        //this.setSlotOffset(1);
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
            
            this.notifyToUserOnFlow();
        
            let oVal={payload:{}};

            if(this.isConsolidable()===true){
                let lastBatterySlot=this.batterySlots.pop();
                oVal.payload=this.get();
                send(oVal);
                this.batterySlots=new Array<BatterySlot>();
                this.consolidable=false;
                this.setDuration(Number(this.config.mainBucketDuration),BalanceNeto.getDurationChronoUnit("minutes"));
                
                if(lastBatterySlot!==undefined){
                    this.batterySlots.push(lastBatterySlot);
                    this._autoConsolidate();
                    oVal.payload=this.get();
                    send(oVal);
                    this.notifyToUserOnFlow();
                }else{
                    this.node.status({fill: "red",shape:"dot",text:"Last batteryslot has benn losted.."});
                }
                
            }else{
                oVal.payload=this.get();
                send(oVal);
            }
            this.writeOnContext();
            done();
        }catch(error){
            this.node.status({fill:"red",shape:"dot",text:error});
            done(error);
        }
    }

    writeOnContext(){
        this.node.log("Writing context for node  "+this.node.id);
        this.context.set("balanceNeto",JSON.stringify(this.get()));
    }

    readFromContext():void{
        this.node.log("Reading from context to recover node status from  "+this.node.id);
        if(this.context.get("balanceNeto")!==undefined){
            let payloadSer=JSON.parse(this.context.get("balanceNeto"));
            this.of(payloadSer.balanceNeto,"json");
            return;
        }

        throw new Error("There is no data in the nodeRED context");

    }


      /**
     * 
     * @param divisor unit divisor for the output energy value
     * @returns energy imported from grid with divisor applied in subBucket length
     */
      getImportedFromGridInSubBuckets(divisor:number):number{
        let count=0;
        this.getFeededInSlotsOf(this.config.subBucketDuration,this.config.subBucketChronoUnit).filter((subBucket:ResultSlot)=>{
            return subBucket.value<0;
        }).forEach(function(item:ResultSlot){
            count+=item.value;
            if(isNaN(count)){
                console.log(item);
                return 0;
            }
        });

        return count/divisor;
    }
    /**
     * 
     * @param divisor unit divisor for the output energy value
     * @returns energy exported to grid with divisor applied in subBucket length
     */
    getExportedToGridInSubBuckets(divisor:number):number{
        let count=0;
        this.getFeededInSlotsOf(this.config.subBucketDuration,this.config.subBucketChronoUnit).filter((subBucket:ResultSlot)=>{
            return subBucket.value>0;
        }).forEach(function(item:ResultSlot){
            count+=item.value;
            if(isNaN(count)){
                console.log(item);
                return 0;
            }
        });

        return count/divisor;
    }
    get():any{
        let oVal=super.get();
        let newData={
            sub_bucket_imported_from_grid:this.getImportedFromGridInSubBuckets(1),
            sub_bucket_exported_to_grid:this.getExportedToGridInSubBuckets(1)
        
        }
        return {balanceNeto:Object.assign(oVal.balanceNeto,newData)};
    }

    notifyToUserOnFlow(){
        this.node.status({fill:"green",shape:"dot",text:"Working fine. In bucket "+this.batterySlots.length});
    }
}