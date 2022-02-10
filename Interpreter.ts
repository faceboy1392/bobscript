import Expr from './Expr';
import { Visitor as ExprVisitor } from './Expr';

import Stmt from './Stmt';
import { Visitor as StmtVisitor } from './Stmt';

import RuntimeError from './RuntimeError';

import Token from './token';
import { TokenType } from './tokenType';

import Environment from './Environment';

const T = TokenType;

export default class Interpreter implements ExprVisitor<any>, StmtVisitor<void> {
    
    environment: Environment = new Environment();

    Bobscript;
    
    constructor() {}

    interpret(Bobscript, statements: Stmt[]) {
        this.Bobscript = Bobscript;
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        } catch (error) {
            Bobscript.runtimeError(error);
        }
    }

    visitBinaryExpr(expr: typeof Expr.Binary) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case T.NOT_EQUAL:
                return !this.isEqual(left, right);
            case T.DOUBLE_EQUAL:
                return this.isEqual(left, right);

            case T.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) > Number(right);
            case T.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) >= Number(right);
            case T.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) < Number(right);
            case T.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) <= Number(right);

            case T.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case T.PLUS:
                if (typeof left === 'number' && typeof right === 'number')
                    return Number(left) + Number(right);

                if (typeof left === 'string' && typeof right === 'string')
                    return String(left) + String(right);

                if (typeof left === 'string')
                    return String(left) + this.stringify(right);

                if (typeof right === 'string')
                    return this.stringify(left) + String(right);

                throw new RuntimeError(
                    expr.operator,
                    'Operands must be two numbers or two strings!'
                );
            case T.SLASH:
                this.checkNumberOperands(expr.operator, left, right);

                if (Number(right) === 0)
                    return new RuntimeError(
                        expr.operator,
                        "no you can't divide by zero stahp it"
                    );

                return Number(left) / Number(right);
            case T.STAR:
                if (typeof left === 'string' && typeof right === 'number') {
                    if (right < 0) throw new RuntimeError(expr.operator, 'Can\'t multiply a string less than zero times!');
                    return String(left).repeat(Number(right));
                }

                if (typeof left === 'number' && typeof right === 'string') {
                    if (left < 0) throw new RuntimeError(expr.operator, 'Can\'t multiply a string less than zero times!');
                    return String(right).repeat(Number(left));
                }

                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);

            case T.POWER:
                this.checkNumberOperands(expr.operator, left, right);

                return Math.pow(Number(left), Number(right));
        }

        // Unreachable.
        return null;
    }

    visitGroupingExpr(expr: typeof Expr.Grouping) {
        return this.evaluate(expr.expression);
    }

    visitLiteralExpr(expr: typeof Expr.Literal) {
        return expr.value;
    }

    visitUnaryExpr(expr: typeof Expr.Unary) {
        const right = this.evaluate(expr.right);

        switch (expr.operator.type) {
            case T.NOT:
                return !this.isTruthy(right);
            case T.MINUS:
                this.checkNumberOperand(expr.operator, right);
                return Number(right) * -1;
        }

        // Unreachable.
        return null;
    }

    visitVariableExpr(expr: typeof Expr.Variable) {
        return this.environment.get(expr.name);
    }

    checkNumberOperand(operator: Token, operand: any): void {
        if (typeof operand === 'number') return;
        throw new RuntimeError(operator, 'Operand must be a number!');
    }

    checkNumberOperands(operator: Token, left: any, right: any): void {
        if (typeof left === 'number' && typeof right === 'number') return;
        throw new RuntimeError(operator, 'Operands must be numbers!');
    }

    isTruthy(value: any): boolean {
        if (value === null) return false;
        if (typeof value === 'boolean') return value;
        return true;
    }

    isEqual(a: any, b: any): boolean {
        if (a === null && b === null) return true;
        if (a === null) return false;

        return a === b;
    }

    stringify(object: any): string {
        if (object === null) return 'nil';

        if (typeof object === 'number') {
            let text: string = object.toString();
            if (text.endsWith('.0')) {
                text = text.substring(0, text.length - 2);
            }
            return text;
        }

        return object.toString();
    }

    evaluate(expr: Expr): any {
        return expr.accept(this);
    }

    execute(stmt: Stmt): void {
        stmt.accept(this);
    }

    visitExpressionStmt(stmt: typeof Stmt.Expression): void {
        this.evaluate(stmt.expression);
        return null;
    }

    visitPrintStmt(stmt: typeof Stmt.Print): void {
        const value: string = this.stringify(this.evaluate(stmt.expression));
        this.Bobscript.message.channel.send(this.trim(value) || 'Missing print string');
        return null;
    }

    visitVarStmt(stmt: typeof Stmt.Var): void {
        let value: any = null;
        if (stmt.initializer !== null) {
            value = this.evaluate(stmt.initializer);
        }

        this.environment.define(stmt.name.lexeme, value);
        return null;
    }

    trim(str: string, max = 2000): string {
        if (!str) return '';
        return str.length > max - 3 ? `${str.slice(0, max - 3)}...` : str;
    }
}
