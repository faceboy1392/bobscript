import Token from './Token';
import { TokenType } from './tokenType';
const T = TokenType;

import Expr from './Expr';
import Stmt from './Stmt';

export default class Parser {
    ParseError = class ParseError extends Error {};

    Bobscript;

    tokens: Token[];
    current: number = 0;

    constructor(Bobscript, tokens: Token[]) {
        this.Bobscript = Bobscript;
        this.tokens = tokens;
    }

    parse(): Stmt[] {
        const statements: Stmt[] = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    expression(): Expr {
        return this.assignment();
    }

    declaration(): Stmt {
        try {
            if (this.match(T.VAR)) return this.varDeclaration();

            return this.statement();
        } catch (error) {
            this.synchronize();
            return null;
        }
    }

    statement(): Stmt {
        if (this.match(T.PRINT)) return this.printStatement();

        return this.expressionStatement();
    }

    printStatement(): Stmt {
        const value: Expr = this.expression();
        this.consume(T.SEMICOLON, "Expecting a semicolon ';' after statement.");
        return new Stmt.Print(value);
    }

    varDeclaration(): Stmt {
        const name: Token = this.consume(
            T.IDENTIFIER,
            'Expecting a variable name.'
        );

        let initializer: Expr = null;
        if (this.match(T.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(
            T.SEMICOLON,
            "Expecting a semicolon ';' after variable declaration."
        );
        return new Stmt.Var(name, initializer);
    }

    expressionStatement(): Stmt {
        const expr: Expr = this.expression();
        this.consume(
            T.SEMICOLON,
            "Expecting a semicolon ';' after expression."
        );
        return new Stmt.Expression(expr);
    }

    assignment(): Expr {
        const expr: Expr = this.equality();

        if (this.match(T.EQUAL)) {
            const equals: Token = this.previous();
            const value: Expr = this.assignment();

            if (expr instanceof Expr.Variable) {
                const name: Token = expr.name;
                return new Expr.Assign(name, value);
            }

            this.error(equals, 'no u cant assign to that');
        }

        return expr;
    }

    equality(): Expr {
        let expr: Expr = this.comparison();

        while (this.match(T.NOT_EQUAL, T.DOUBLE_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expr = this.comparison();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    comparison(): Expr {
        let expr: Expr = this.term();

        while (this.match(T.GREATER, T.GREATER_EQUAL, T.LESS, T.LESS_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expr = this.term();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    term(): Expr {
        let expr: Expr = this.factor();

        while (this.match(T.MINUS, T.PLUS)) {
            const operator: Token = this.previous();
            const right: Expr = this.factor();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    factor(): Expr {
        let expr: Expr = this.exponent();

        while (this.match(T.SLASH, T.STAR)) {
            const operator: Token = this.previous();
            const right: Expr = this.exponent();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    exponent(): Expr {
        let expr: Expr = this.unary();

        while (this.match(T.POWER)) {
            const operator: Token = this.previous();
            const right: Expr = this.unary();
            expr = new Expr.Binary(expr, operator, right);
        }

        return expr;
    }

    unary(): Expr {
        if (this.match(T.NOT, T.MINUS)) {
            const operator: Token = this.previous();
            const right: Expr = this.unary();
            return new Expr.Unary(operator, right);
        }

        return this.primary();
    }

    primary(): Expr {
        if (this.match(T.FALSE)) return new Expr.Literal(false);
        if (this.match(T.TRUE)) return new Expr.Literal(true);
        if (this.match(T.NIL)) return new Expr.Literal(null);

        if (this.match(T.NUMBER, T.STRING)) {
            return new Expr.Literal(this.previous().literal);
        }

        if (this.match(T.IDENTIFIER)) {
            return new Expr.Variable(this.previous());
        }

        if (this.match(T.LEFT_PAREN)) {
            const expr: Expr = this.expression();
            this.consume(
                T.RIGHT_PAREN,
                "There should be a ')' after this expression."
            );
            return new Expr.Grouping(expr);
        }

        throw this.error(this.peek(), 'Expecting an expression here.');
    }

    match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    consume(type: TokenType, message: string) {
        if (this.check(type)) return this.advance();

        throw this.error(this.peek(), message);
    }

    check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd(): boolean {
        return this.peek().type === T.EOF;
    }

    peek(): Token {
        return this.tokens[this.current];
    }

    previous(): Token {
        return this.tokens[this.current - 1];
    }

    error(token: Token, message: string) {
        this.Bobscript.error(token, message);
        return new this.ParseError();
    }

    synchronize(): void {
        this.advance();

        while (!this.isAtEnd()) {
            if ((this.previous().type = T.SEMICOLON)) return;

            switch (this.peek().type) {
                case T.CLASS:
                case T.FUN:
                case T.FOR:
                case T.IF:
                case T.WHILE:
                case T.PRINT:
                case T.RETURN:
                    return;
            }

            this.advance();
        }
    }
}
