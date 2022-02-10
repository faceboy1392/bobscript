import Expr from './Expr'
import { Visitor } from './Expr';
import Token from './token';
import { TokenType } from './tokenType';

/*export default class AstPrinter implements Visitor<String> {
    print(expr: Expr): string {
        if (!expr) return '[invalid]';
        return expr.accept(this);
    }
    visitBinaryExpr(expr: typeof Expr.Binary) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
    }
    visitGroupingExpr(expr: typeof Expr.Grouping) {
        return this.parenthesize('group', expr.expression)
    }
    visitLiteralExpr(expr: typeof Expr.Literal) {
        if (expr.value === null) return 'nil';
        if (typeof expr.value === 'string') return '"' + expr.value + '"';
        return expr.value.toString();
    }
    visitUnaryExpr(expr: typeof Expr.Unary) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }
    visitVariableExpr(expr: typeof Expr.Variable) {
        return this.parenthesize("var" + expr.name.lexeme, expr.initializer);
    }
    parenthesize(name: string, ...exprs: Expr[]): string {
        let text = '';

        text += `(${name}`;
        for (const expr of exprs) {
            text += ' ';
            text += expr.accept(this);
        }
        text += ')';

        return text;
    }
}*/