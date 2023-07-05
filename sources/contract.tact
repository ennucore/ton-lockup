import "@stdlib/deploy";

message Retranslate {
    value: Int as coins;
    body: Cell;
    to: Address;
    bounce: Bool;
    mode: Int;
}

contract Lockup with Deployable {

    owner: Address;
    unlock_time: Int;

    init(owner: Address, unlock_time: Int) {
        self.owner = owner;
        self.unlock_time = unlock_time;
    }

    receive(msg: Retranslate) {
        let ctx: Context = context();
        require(self.owner == ctx.sender, "Only the owner can send messages");
        require(self.unlock_time < now(), "Unlock time has not come yet");
        send(SendParameters{
            value: msg.value,
            bounce: msg.bounce,
            to: msg.to,
            body: msg.body,
            mode: msg.mode
        });
    }

    get fun unlock_time(): Int {
        return self.unlock_time;
    }
}