"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBalanceNeto = void 0;
const BalanceNeto_js_1 = require("@virtualbat/entities/dist/src/BalanceNeto.js");
class NodeBalanceNeto extends BalanceNeto_js_1.BalanceNeto {
    constructor(node, config, nodeContext) {
        super(undefined);
    }
    /**
     * Receives a message from a previous node and make main processs
     * @param msg
     * @param send
     * @param done
     */
    onInput(msg, send, done) {
    }
    writeOnContext() {
    }
    readFromContext() {
    }
}
exports.NodeBalanceNeto = NodeBalanceNeto;
