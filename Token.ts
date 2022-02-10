import { TokenType } from './tokenType';

export default class Token {
    type: TokenType;
    lexeme: string;
    literal: any;
    line: number;
    index: number;

    constructor(type: TokenType, lexeme: string, literal: any, line: number, index?: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
        this.index = index;
    }

    toString() {
        return `type: ${this.type} | lexeme: ${this.lexeme} | literal: ${this.literal} `;
    }
}
