export class StateMachine {
    name: string;
    arn: string;
    type: string;

    constructor(name: string, arn: string, type: string) {
        this.name = name;
        this.arn = arn;
        this.type = type;
    }
}
