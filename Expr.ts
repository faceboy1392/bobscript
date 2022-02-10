import Token from './token'

class Expr {
    constructor() {}
    static Assign;
    static Binary;
    static Grouping;
    static Literal;
    static Unary;
    static Variable;

    accept<R>(visitor: Visitor<R>): any {}
}

class Assign extends Expr {
    name: Token
    value: Expr

    constructor(name: Token, value: Expr) {
        super();
        this.name = name;
        this.value = value;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitAssignExpr(this);
    }
}

class Binary extends Expr {
    left: Expr
    operator: Token
    right: Expr

    constructor(left: Expr, operator: Token, right: Expr) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitBinaryExpr(this);
    }
}

class Grouping extends Expr {
    expression: Expr

    constructor(expression: Expr) {
        super();
        this.expression = expression;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitGroupingExpr(this);
    }
}

class Literal extends Expr {
    value: any

    constructor(value: any) {
        super();
        this.value = value;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitLiteralExpr(this);
    }
}

class Unary extends Expr {
    operator: Token
    right: Expr

    constructor(operator: Token, right: Expr) {
        super();
        this.operator = operator;
        this.right = right;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitUnaryExpr(this);
    }
}

class Variable extends Expr {
    name: Token

    constructor(name: Token) {
        super();
        this.name = name;
    }

    accept<R>(visitor: Visitor<R>): R {
        return visitor.visitVariableExpr(this);
    }
}

Expr.Assign = Assign;
Expr.Binary = Binary;
Expr.Grouping = Grouping;
Expr.Literal = Literal;
Expr.Unary = Unary;
Expr.Variable = Variable;

export default Expr;

export interface Visitor<R> {
    visitAssignExpr: (expr: Assign) => R;
    visitBinaryExpr: (expr: Binary) => R;
    visitGroupingExpr: (expr: Grouping) => R;
    visitLiteralExpr: (expr: Literal) => R;
    visitUnaryExpr: (expr: Unary) => R;
    visitVariableExpr: (expr: Variable) => R;
}
