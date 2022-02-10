import Scanner from './Scanner';
import Parser from './Parser';

import { TokenType } from './TokenType';
import RuntimeError from './RuntimeError';
import Interpreter from './Interpreter';

import { Message } from 'discord.js';

export default class Bobscript {
    interpreter: Interpreter = new Interpreter();

    message: Message;

    errors: string[] = [];

    hadError: boolean = false;
    hadRuntimeError: boolean = false;

    constructor() {}

    async run(message: Message, source: string): Promise<void> {
        this.message = message;

        if (!source?.length) return;

        const scanner = new Scanner(this, source);
        const tokens = scanner.scanTokens();
        if (this.hadError) return;

        ////console.log(tokens.map(token => token.toString()).join('\n'));

        const parser = new Parser(this, tokens);
        const statements = parser.parse();
        if (this.hadError) return;

        ////console.log(JSON.stringify(statements));

        this.interpreter.interpret(this, statements);
    }

    error(token, message: string): void {
        // Lets it use either a token or line number as the first argument.
        if (Number.isInteger(token)) {
            // If it's a line number.
            this.report(token, token?.index || null, '', message);
        } else if (token.type === TokenType.EOF) {
            this.report(token.line, token?.index || null, ' at end', message);
        } else {
            this.report(
                token.line,
                token?.index || null,
                ` at ' ${token.lexeme} '`,
                message
            );
        }
    }

    runtimeError(error: RuntimeError): void {
        const errMessage = `${error.message}\n[Line ${error?.token?.line}]`;
        console.log(errMessage); //! Logging for use in development only, replace it later
        this.hadRuntimeError = true;
        this.errors.push(errMessage);
        this.message.channel.send(errMessage);
    }

    report(
        line: number,
        index: number,
        where: string,
        message: string
    ): void {
        // Logging to console is temporary, in the future it will use other methods
        const errMessage = `[Line ${line}${
            typeof index === 'number' ? ':' + (index + 1) : ''
        }] Error${where}: ${message}`;
        console.error(errMessage);
        this.hadError = true;
        this.errors.push(errMessage);
        this.message.channel.send(errMessage);
    }
}
