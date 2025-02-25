"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBalanceNeto = exports.TimeUnits = void 0;
const BalanceNeto_js_1 = require("@virtualbat/entities/dist/src/BalanceNeto.js");
const BatterySlot_1 = require("@virtualbat/entities/dist/src/BatterySlot");
var TimeUnits;
(function (TimeUnits) {
    TimeUnits["MINUTE"] = "minutos";
})(TimeUnits = exports.TimeUnits || (exports.TimeUnits = {}));
class NodeBalanceNeto extends BalanceNeto_js_1.BalanceNeto {
    constructor(node, config, nodeContext) {
        super(undefined);
        this.currentSubBucketIndex = 0;
        this.config = config;
        this.node = node;
        this.context = nodeContext;
        try {
            this.readFromContext();
        }
        catch (e) {
            node.error(e);
        }
        this.setDuration(Number(this.config.mainBucketDuration), BalanceNeto_js_1.BalanceNeto.getDurationChronoUnit("minutes"));
        this.setSlotOffset(Number(this.config.incomingSlotsReadingTimeStampOffset));
        //this.setSlotOffset(1);
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
            let oVal = { payload: {} };
            if (this.isConsolidable() === true) {
                oVal.payload = this.get();
                send(oVal);
                this.batterySlots = new Array();
                this.consolidable = false;
                this.setDuration(Number(this.config.mainBucketDuration), BalanceNeto_js_1.BalanceNeto.getDurationChronoUnit("minutes"));
            }
            else {
                oVal.payload = this.get();
                send(oVal);
            }
            this.writeOnContext();
            done();
        }
        catch (error) {
            this.node.status({ fill: "red", shape: "dot", text: error });
            done(error);
        }
    }
    writeOnContext() {
        this.node.log("Writing context for node  " + this.node.id);
        this.context.set("balanceNeto", JSON.stringify(this.get()));
    }
    readFromContext() {
        this.node.log("Reading from context to recover node status from  " + this.node.id);
        if (this.context.get("balanceNeto") !== undefined) {
            let payloadSer = JSON.parse(this.context.get("balanceNeto"));
            this.of(payloadSer.balanceNeto, "json");
            return;
        }
        throw new Error("There is no data in the nodeRED context");
    }
    /**
   *
   * @param divisor unit divisor for the output energy value
   * @returns energy imported from grid with divisor applied in subBucket length
   */
    getImportedFromGridInSubBuckets(divisor) {
        let count = 0;
        this.getFeededInSlotsOf(this.config.subBucketDuration, TimeUnits.MINUTE).filter((subBucket) => {
            return subBucket.value < 0;
        }).forEach(function (item) {
            count += item.value;
            if (isNaN(count)) {
                console.log(item);
                return 0;
            }
        });
        return count / divisor;
    }
    /**
     *
     * @param divisor unit divisor for the output energy value
     * @returns energy exported to grid with divisor applied in subBucket length
     */
    getExportedToGridInSubBuckets(divisor) {
        let count = 0;
        this.getFeededInSlotsOf(this.config.subBucketDuration, TimeUnits.MINUTE).filter((subBucket) => {
            return subBucket.value > 0;
        }).forEach(function (item) {
            count += item.value;
            if (isNaN(count)) {
                console.log(item);
                return 0;
            }
        });
        return count / divisor;
    }
    get() {
        let oVal = super.get();
        let newData = {
            sub_bucket_imported_from_grid: this.getImportedFromGridInSubBuckets(1),
            sub_bucket_exported_to_grid: this.getExportedToGridInSubBuckets(1)
        };
        return { balanceNeto: Object.assign(oVal.balanceNeto, newData) };
    }
}
exports.NodeBalanceNeto = NodeBalanceNeto;
