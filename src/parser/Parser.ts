import { Lexer } from '../lexer/Lexer';
import { ProgramNode, BlockNode, ConstDeclarationNode, VariableDeclartionNode, ProcedureDeclarationNode, ConstAssignmentNode } from './SyntaxNode';
import { SyntaxToken } from '../lexer/SyntaxToken';
import { SyntaxKind } from '../lexer/SyntaxKind';

export interface Diagnostic {
  pos: number;
  message: string;
}

export class Parser {
  private tokens: SyntaxToken[] = [];
  private pos: number = 0;
  private index: number = 0;
  private lexer: Lexer;
  public diagnostics: Diagnostic[] = [];

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
    while (true) {
      const token = this.lexer.lex();
      this.tokens.push(token);
      if (token.kind === SyntaxKind.EOFToken) {
        break;
      }
    }
    
    this.skipTrivia();
    const programNode = new ProgramNode(0, this.lexer.text, this.parseBlock());
    return programNode;
  }

  private parseBlock(): BlockNode {
    let constDeclaration: ConstDeclarationNode | undefined;
    let variableDeclaration: VariableDeclartionNode | undefined;
    let procedureDeclarations: ProcedureDeclarationNode[] = [];
    const start = this.pos;
    if (this.currentToken.kind === SyntaxKind.ConstKeyword) {
      constDeclaration = this.parseConstDeclaration();
    }
    this.skipTrivia();
    if (this.currentToken.kind === SyntaxKind.VarKeyword) {
      variableDeclaration = this.parseVariableDeclaration();
    }
    this.skipTrivia();
    while (this.currentToken.kind === SyntaxKind.ProcedureKeyword) {
      procedureDeclarations.push(this.parseProcedureDeclaration());
    }
    this.skipTrivia();
    const statement = this.parseStatement();

    const end = this.pos;
    return new BlockNode(
      start,
      this.getText(start, end),
      constDeclaration,
      variableDeclaration,
      procedureDeclarations,
      statement,
    );
  }

  private parseConstDeclaration(): ConstDeclarationNode {
    const pos = this.pos;
    const token = this.advance() as SyntaxToken<SyntaxKind.ConstKeyword>;
    this.skipSingleLineTrivia();
    let assignments: ConstAssignmentNode[] = [];
    while (this.currentToken.kind !== SyntaxKind.SemicolonToken && this.currentToken.kind !== SyntaxKind.NewlineTrivia) {
      assignments.push(this.parseConstAssignment());
      this.skipSingleLineTrivia();
    }
    const lastTokenPos = this.pos;
    const semicolonToken = this.advance();
    if (semicolonToken.kind !== SyntaxKind.SemicolonToken) {
      this.diagnostics.push({
        pos: lastTokenPos,
        message: '‘;’ expected',
      });
    }

    return new ConstDeclarationNode(pos, this.getText(pos, this.pos), token, assignments);
  }

  private parseConstAssignment(): ConstAssignmentNode {
    const pos = this.pos;
    const leftIdentifier = this.advance() as SyntaxToken<SyntaxKind.Identifier>;
    if (leftIdentifier.kind !== SyntaxKind.Identifier) {
      this.diagnostics.push({ pos, message: 'Identifier expected' });
    }
    this.skipSingleLineTrivia();
    const equalTokenPos = this.pos;
    const equalToken = this.advance() as SyntaxToken<SyntaxKind.EqualToken>;
    if (equalToken.kind !== SyntaxKind.EqualToken) {
      this.diagnostics.push({ pos: equalTokenPos, message: '‘=’ expected' });
    }
    this.skipSingleLineTrivia();
    const expression = this.parseExpression();

    return new ConstAssignmentNode(pos, this.getText(pos, this.pos), leftIdentifier, equalToken, expression);
  }

  private parseVariableDeclaration(): VariableDeclartionNode {
    const pos = this.pos;
    const varToken = this.advance() as SyntaxToken<SyntaxKind.VarKeyword>;
    this.skipSingleLineTrivia();
    let identifiers: SyntaxToken<SyntaxKind.Identifier>[] = [];
    while (true) {
      const identifierPos = this.pos;
      const token = this.advance();
      if (token.kind === SyntaxKind.Identifier) {
        identifiers.push(token as SyntaxToken<SyntaxKind.Identifier>);
      } else {
        this.diagnostics.push({ pos: identifierPos, message: 'Identifier expected' });
      }
      this.skipSingleLineTrivia();
      const next = this.advance();
      if (next.kind !== SyntaxKind.CommaToken) {
        break;
      }
    }
    this.skipSingleLineTrivia();
    const endTokenPos = this.pos;
    const endToken = this.advance();
    if (endToken.kind !== SyntaxKind.SemicolonToken) {
      this.diagnostics.push({ pos: endTokenPos, message: '‘;’ expected' });
    }

    return new VariableDeclartionNode(pos, this.getText(pos, this.pos), identifiers);
  }

  private skipSingleLineTrivia(): void {
    const { kind } = this.currentToken;
    while (kind === SyntaxKind.WhitespaceTrivia) {
      this.advance();
    }
  }

  private skipTrivia(): void {
    const { kind } = this.currentToken;
    while (kind === SyntaxKind.WhitespaceTrivia || kind === SyntaxKind.NewlineTrivia) {
      this.advance();
    }
  }

  private advance(): SyntaxToken {
    const token = this.currentToken;
    this.index++;
    this.pos += token.value ? token.value.length : 0;
    return token;
  }

  private get currentToken(): SyntaxToken {
    return this.tokens[this.index];
  }

  private getText(start: number, end: number): string {
    return this.lexer.text.slice(start, end);
  }
}