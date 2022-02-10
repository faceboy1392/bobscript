class GenerateAst {
    static main() {
        const arg = process.argv[2];
        if (!arg) {
            console.error('hey idiot you gotta provide an argument');
            process.exit();
        }
        this.defineAst(arg, [
            'Assign     | name: Token, value: Expr',
            'Binary     | left: Expr, operator: Token, right: Expr',
            'Grouping   | expression: Expr',
            'Literal    | value: any',
            'Unary      | operator: Token, right: Expr',
            'Variable   | name: Token'
        ]);
        /*
        
            Expr
            'Assign     | name: Token, value: Expr',
            'Binary     | left: Expr, operator: Token, right: Expr',
            'Grouping   | expression: Expr',
            'Literal    | value: any',
            'Unary      | operator: Token, right: Expr',
            'Variable   | name: Token'

            Stmt
            'Expression  | expression: Expr',
            'Print       | expression: Expr',
            'Var         | name: Token, initializer: Expr'
        
        */
    }
    static text = '';
    static write(str = '') {
        this.text += str + '\n';
    }
    static defineAst(baseName: string, types: string[]) {
        this.write("import Token from './token'");
        this.write();
        this.write('class ' + baseName + ' {');
        this.write('    constructor() {}');

        // The AST classes.
        for (const type of types) {
            const className: string = type.split('|')[0].trim();
            this.write('    static ' + className + ';');
        }

        this.write();
        this.write('    accept<R>(visitor: Visitor<R>): any {}');
        this.write('}');

        this.write();

        for (const type of types) {
            const className: string = type.split('|')[0].trim();
            const fields: string = type.split('|')[1].trim();
            this.defineType(baseName, className, fields);
        }

        for (const type of types) {
            const className: string = type.split('|')[0].trim();
            this.write(baseName + '.' + className + ' = ' + className + ';');
        }

        this.write();
        this.write('export default ' + baseName + ';');
        this.write();

        this.defineVisitor(baseName, types);
    }
    static defineType(baseName: string, className: string, fieldList: string) {
        this.write('class ' + className + ' extends ' + baseName + ' {');

        // Class properties.
        const fields = fieldList.split(', ');
        for (const field of fields) {
            this.write('    ' + field);
        }

        this.write();
        this.write('    constructor(' + fieldList + ') {');
        this.write('        super();');

        for (const field of fields) {
            const name = field.split(':')[0].trim();
            this.write('        this.' + name + ' = ' + name + ';');
        }

        this.write('    }')
        this.write();

        // Accept thingy
        this.write('    accept<R>(visitor: Visitor<R>): R {');
        this.write('        return visitor.visit' + className + baseName + '(this);');
        this.write('    }');

        this.write('}');
        this.write();
    }
    static defineVisitor(baseName: string, types: string[]) {
        this.write('export interface Visitor<R> {');

        for (const type of types) {
            const className: string = type.split('|')[0].trim();
            this.write('    visit' + className + baseName + ': (' + baseName.toLowerCase() + ': ' + className + ') => R;');
        }

        this.write('}');
    }
}

GenerateAst.main();

console.log(GenerateAst.text);
