import { Lexer } from '../lexer/Lexer';
import { ProgramNode } from './SyntaxNode';

export class Parser {
  private lexer: Lexer;

  constructor(lexer: Lexer)
  constructor(text: string)
  constructor(textOrLexer: string | Lexer) {
    if (typeof textOrLexer === 'string') {
      this.lexer = new Lexer(textOrLexer);
    } else {
      this.lexer = textOrLexer;
    }
  }

  public parse(): ProgramNode {

  }
}