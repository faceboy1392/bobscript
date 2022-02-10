export enum TokenType {
    // 1 char tokens
    LEFT_PAREN = 'LEFT_PAREN',
    RIGHT_PAREN = 'RIGHT_PAREN',
    LEFT_BRACE = 'LEFT_BRACE',
    RIGHT_BRACE = 'RIGHT_BRACE',
    COMMA = 'COMMA',
    DOT = 'DOT',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
    SEMICOLON = 'SEMICOLON',
    SLASH = 'SLASH',
    STAR = 'STAR',
    POWER = 'POWER',

    // 1-2 char tokents
    NOT = 'NOT',
    NOT_EQUAL = 'NOT_EQUAL',
    EQUAL = 'EQUAL',
    DOUBLE_EQUAL = 'DOUBLE_EQUAL',
    GREATER = 'GREATER',
    GREATER_EQUAL = 'GREATER_EQUAL',
    LESS = 'LESS',
    LESS_EQUAL = 'LESS_EQUAL',

    // Literals
    IDENTIFIER = 'IDENTIFIER',
    STRING = 'STRING',
    NUMBER = 'NUMBER',

    // Keywords
    AND = 'AND',
    CLASS = 'CLASS',
    ELSE = 'ELSE',
    FALSE = 'FALSE',
    FUN = 'FUN',
    FOR = 'FOR',
    IF = 'IF',
    NIL = 'NIL',
    OR = 'OR',
    PRINT = 'PRINT',
    RETURN = 'RETURN',
    SUPER = 'SUPER',
    THIS = 'THIS',
    TRUE = 'TRUE',
    WHILE = 'WHILE',
    VAR = 'VAR',

    EOF = 'EOF'
}
