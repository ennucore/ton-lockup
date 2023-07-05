import { Address, Cell } from "ton";
import { Retranslate } from "./output/lockup_Lockup";


export function buildSimpleRetranslate(value: number | bigint, body: Cell, to: Address) {
    return {
        $$type: "Retranslate",
        value: BigInt(value),
        body: body,
        to: to,
        bounce: false,
        mode: 0n
} as Retranslate;
}
