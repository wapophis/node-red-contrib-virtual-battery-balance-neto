import {BalanceNeto} from "@virtualbat/entities/dist/src/BalanceNeto.js";

export type NodeBalanceNetoConfig={
    mainBucketDuration:number,
    subBucketDuration:number
}

export class NodeBalanceNeto extends BalanceNeto{

    constructor(node:any,config:any,nodeContext:any){
        super(undefined);
    }


    /**
     * Receives a message from a previous node and make main processs
     * @param msg 
     * @param send 
     * @param done 
     */
    onInput(msg:any,send:any,done:any){

    }


    writeOnContext(){

    }

    readFromContext(){

    }

}