import Token from './token'
import Expr from './Expr';

class Stmt {
    constructor() {}
    static Expression;
    static Print;
    static Var;

    accept<R>(visitor: Visitor<R>): any {}
}

class Expression extends Stmt {
    expression: Expr

    constructor(expression: Expr) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitExpressionStmt(this);
    }
}

class Print extends Stmt {
    expression: Expr

    constructor(expression: Expr) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitPrintStmt(this);
    }
}

class Var extends Stmt {
    name: Token
    initializer: Expr

    constructor(name: Token, initializer: Expr) {
        super();
        this.name = name;
        this.initializer = initializer;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitVarStmt(this);
    }
}

Stmt.Expression = Expression;
Stmt.Print = Print;
Stmt.Var = Var;

export default Stmt;

export interface Visitor<R> {
    visitExpressionStmt: (stmt: Expression) => R;
    visitPrintStmt: (stmt: Print) => R;
    visitVarStmt: (stmt: Var) => R;
}
