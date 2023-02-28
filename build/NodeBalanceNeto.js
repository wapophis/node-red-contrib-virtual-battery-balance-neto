"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBalanceNeto = void 0;
const BalanceNeto_js_1 = require("@virtualbat/entities/dist/src/BalanceNeto.js");
const BatterySlot_1 = require("@virtualbat/entities/dist/src/BatterySlot");
class NodeBalanceNeto extends BalanceNeto_js_1.BalanceNeto {
    constructor(node, config, nodeContext) {
        super(undefined);
        this.config = config;
        this.node = node;
        this.context = nodeContext;
        this.setDuration(Number(this.config.mainBucketDuration));
        node.log(JSON.stringify({ event: "INIT", node: this.node, config: this.config }));
    }
    /**
     * Receives a message from a previous node and make main processs
     * @param msg
     * @param send
     * @param done
     */
    onInput(msg, send, done) {
        this.node.log("INPUT RECEIVED");
        try {
            this.addBatterySlot(new BatterySlot_1.BatterySlot(msg.payload));
            this.node.status({ fill: "green", shape: "dot", text: "Working fine. In bucket " + this.batterySlots.length });
        }
        catch (error) {
            this.node.status({ fill: "red", shape: "dot", text: error });
            throw error;
        }
        let oVal = { payload: {} };
        if (this.isConsolidable() === true) {
            oVal.payload = this.get();
            send(oVal);
            this.batterySlots = new Array();
            this.consolidable = false;
            this.setDuration(Number(this.config.mainBucketDuration));
        }
        else {
        }
    }
    writeOnContext() {
        this.context.set("balanceNeto", JSON.stringify(this.get()));
    }
    readFromContext() {
        if (this.context.get("balanceNeto") !== undefined) {
            let payloadSer = JSON.parse(this.context.get("balanceNeto"));
            let oval = payloadSer;
            this.of(oval);
        }
    }
}
exports.NodeBalanceNeto = NodeBalanceNeto;
