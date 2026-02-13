export default class BlueprintError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'BlueprintError';
    }
}
