import Token from './Token';
import { TokenType } from './tokenType';
const T = TokenType;

export default class Scanner {
    Bobscript;

    source: string;
    tokens: Token[];

    start: number;
    current: number;
    line: number;

    keywords = {
        and: T.AND,
        class: T.CLASS,
        else: T.ELSE,
        false: T.FALSE,
        for: T.FOR,
        fun: T.FUN,
        if: T.IF,
        nil: T.NIL,
        or: T.OR,
        print: T.PRINT,
        return: T.RETURN,
        super: T.SUPER,
        this: T.THIS,
        true: T.TRUE,
        while: T.WHILE,
        var: T.VAR
    };

    constructor(Bobscript, source: string) {
        this.Bobscript = Bobscript;
        this.source = source;
    }

    scanTokens(): Token[] {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;

        while (!this.isAtEnd()) {
            // Beginning of next lexeme
            this.start = this.current;
            this.scanToken();
        }

        // Add a semicolon at the end of every script
        if (this.tokens[this.tokens.length - 1].type !== T.SEMICOLON)
            this.tokens.push(new Token(T.SEMICOLON, '', null, this.line));
        this.tokens.push(new Token(T.EOF, '', null, this.line));
        return this.tokens;
    }

    scanToken(): void {
        const c = this.advance();
        switch (c) {
            case '(':
                this.addToken(T.LEFT_PAREN);
                break;
            case ')':
                this.addToken(T.RIGHT_PAREN);
                break;
            case '{':
                this.addToken(T.LEFT_BRACE);
                break;
            case '}':
                this.addToken(T.RIGHT_BRACE);
                break;
            case ',':
                this.addToken(T.COMMA);
                break;
            case '.':
                this.addToken(T.DOT);
                break;
            case '-':
                this.addToken(T.MINUS);
                break;
            case '+':
                this.addToken(T.PLUS);
                break;
            case ';':
                this.addToken(T.SEMICOLON);
                break;
            case '*':
                this.addToken(T.STAR);
                break;
            case '^':
                this.addToken(T.POWER);
                break;

            case '!':
                this.addToken(this.match('=') ? T.NOT_EQUAL : T.NOT);
                break;
            case '=':
                this.addToken(this.match('=') ? T.DOUBLE_EQUAL : T.EQUAL);
                break;
            case '>':
                this.addToken(this.match('=') ? T.GREATER_EQUAL : T.GREATER);
                break;
            case '<':
                if (this.match('=')) {
                    this.addToken(T.LESS_EQUAL);
                } else if (this.match('-')) {
                    // Allows the usage of '<-' as an alternative to '=', similar to R
                    this.addToken(T.EQUAL);
                } else {
                    this.addToken(T.LESS);
                }
                break;

            case '/':
                if (this.match('/')) {
                    // Comment that goes until the end of the line
                    while (this.peek() !== '\n' && !this.isAtEnd())
                        this.advance();
                } else if (this.match('*')) {
                    /* multiline comments */
                    let count = 1;
                    while (count !== 0 && !this.isAtEnd()) {
                        if (this.peek() === '\n') this.line++;
                        // Increment count whenever / * is encountered
                        if (this.peek() === '/' && this.peekNext() === '*')
                            count++;
                        // Decrement count whenever * / is encountered
                        if (this.peek() === '*' && this.peekNext() === '/')
                            count--;
                        this.advance();
                    }

                    if (this.isAtEnd()) {
                        this.Bobscript.error(
                            this.line,
                            'Unclosed comment (don\'t forget the " */ ").'
                        );
                        return;
                    }

                    // Consume the closing end of the comment
                    this.advance();
                    this.advance();
                } else {
                    this.addToken(T.SLASH);
                }
                break;

            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;

            case '…':
                if (this.match('\n')) {
                    this.line++;
                } else {
                    this.Bobscript.error(
                        this.line,
                        `Ellipses … must be at the end of a line.`
                    );
                }
                break;

            case '\n':
                this.line++;
                // Automatic semicolon insertion
                if (this.tokens[this.tokens.length - 1]?.type !== T.SEMICOLON) { 
                    this.tokens.push(
                        new Token(T.SEMICOLON, '', null, this.line - 1)
                    );
                }
                break;

            case "'":
                this.string("'");
                break;

            case '"':
                this.string('"');
                break;

            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    this.Bobscript.error(
                        this.line,
                        `Unexpected character " ${c} " (try deleting that character).`
                    );
                }
                break;
        }
    }

    identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        let type = this.keywords[text];
        if (!type) type = T.IDENTIFIER;
        this.addToken(type);
    }

    number(): void {
        while (this.isDigit(this.peek())) this.advance();

        // Look for decimals
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // eat decimal
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }

        this.addToken(
            T.NUMBER,
            Number.parseFloat(this.source.substring(this.start, this.current))
        );
    }

    string(char): void {
        // Some extra code here allows strings to have \' or \" in them without ending the string
        while (
            !(
                this.peek() === char &&
                this.source.charAt(this.current - 1) !== '\\'
            ) &&
            !this.isAtEnd()
        ) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }

        if (this.isAtEnd()) {
            this.Bobscript.error(
                this.line,
                `Unclosed string (don\'t forget the second quotation mark ${char}).`
            );
            return;
        }

        // Closing "
        this.advance();

        // Remove surrounding quotation marks
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(T.STRING, value);
    }

    match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) != expected) return false;

        this.current++;
        return true;
    }

    peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }

    peekNextNext(): string {
        if (this.current + 2 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 2);
    }

    isAlpha(c): boolean {
        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    isDigit(c): boolean {
        return c >= '0' && c <= '9';
    }

    isAlphaNumeric(c): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    advance(): string {
        return this.source.charAt(this.current++);
    }

    addToken(type: TokenType, literal?: any): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(
            new Token(
                type,
                text,
                literal !== undefined ? literal : null,
                this.line,
                this.start
            )
        );
    }
}
