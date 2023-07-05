import { toNano, beginCell } from "ton";
import { ContractSystem } from "@tact-lang/emulator";
import { Lockup } from "./output/lockup_Lockup";
import { buildSimpleRetranslate } from "./utils";

describe("contract", () => {
    it("should deploy and work correctly", async () => {
        // Create ContractSystem and deploy contract
        let system = await ContractSystem.create();
        let owner = system.treasure("owner");
        let nonOwner = system.treasure("non-owner");
        let unlock_time = BigInt(system.now + 60);
        let contract = system.open(await Lockup.fromInit(owner.address, unlock_time));
        system.name(contract.address, "main");
        let track = system.track(contract);
        await contract.send(owner, { value: toNano(100) }, { $$type: "Deploy", queryId: 0n });
        await system.run();
        expect(track.collect()).toMatchSnapshot();

        expect(await contract.getUnlockTime()).toEqual(unlock_time);
        let msg = buildSimpleRetranslate(toNano(1), beginCell().endCell(), owner.address);

        await contract.send(owner, { value: toNano(1) }, msg);
        await system.run();
        let events = track.collect()[0].events;
        expect(events).toMatchSnapshot();
        expect((events[1] as any).errorMessage).toEqual('Unlock time has not come yet');

        system.update({now: system.now + 200 * 24 * 3600})
        await contract.send(nonOwner, { value: toNano(1) }, msg);
        await system.run();

        events = track.collect()[0].events;
        expect(events).toMatchSnapshot();
        expect((events[1] as any).errorMessage).toEqual('Only the owner can send messages');

        await contract.send(owner, { value: toNano(1) }, msg);
        await system.run();
        events = track.collect()[0].events;
        expect(events).toMatchSnapshot();
        expect(events[1].$type).toEqual('processed');
        
    });
});
