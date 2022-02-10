import RuntimeError from './RuntimeError';
import Token from './token';

export default class Environment {
    values: Map<string, any> = new Map();

    define(name: string, value: any): void {
        this.values.set(name, value);
    }

    get(name: Token): any {
        const value = this.values.get(name.lexeme);
        if (value !== undefined) return value;

        throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
    }
}
