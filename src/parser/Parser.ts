import { Lexer } from '../lexer/Lexer';
import { ProgramNode, BlockNode, ConstDeclarationNode, VariableDeclartionNode, ProcedureDeclarationNode, ConstAssignmentNode, ExpressionNode, NumericLiteralExpressionNode, SyntaxNode, IdentifierExpressionNode, ArithmeticExpressionNode, ParenthesizedExpressionNode, isArithmeticOperatorToken, ArithmeticOperatorTokenSyntaxKind, StatementNode } from './SyntaxNode';
import { SyntaxToken } from '../lexer/SyntaxToken';
import { SyntaxKind } from '../lexer/SyntaxKind';
import { getArithmeticOperatorPrecedence } from '../util/syntaxFacts';

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
    while (true) {
      const token = this.lexer.lex();
      this.tokens.push(token);
      if (token.kind === SyntaxKind.EOFToken) {
        break;
      }
    }
  }

  public parse(): ProgramNode {
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
    const token = this.matchToken(SyntaxKind.ConstKeyword);
    this.skipSingleLineTrivia();
    let assignments: ConstAssignmentNode[] = [];
    while (this.currentToken.kind !== SyntaxKind.SemicolonToken && this.currentToken.kind !== SyntaxKind.NewlineTrivia) {
      assignments.push(this.parseConstAssignment());
      this.skipSingleLineTrivia();
    }
    this.matchToken(SyntaxKind.SemicolonToken);

    return new ConstDeclarationNode(pos, this.getText(pos, this.pos), token, assignments);
  }

  private parseConstAssignment(): ConstAssignmentNode {
    const pos = this.pos;
    const leftIdentifier = this.matchToken(SyntaxKind.Identifier);
    this.skipSingleLineTrivia();
    const equalToken = this.matchToken(SyntaxKind.EqualToken);
    this.skipSingleLineTrivia();
    const expression = this.parseNumericLiteralExpression();

    return new ConstAssignmentNode(pos, this.getText(pos, this.pos), leftIdentifier, equalToken, expression);
  }

  private parseVariableDeclaration(): VariableDeclartionNode {
    const pos = this.pos;
    const varToken = this.matchToken(SyntaxKind.VarKeyword);
    this.skipSingleLineTrivia();
    let identifiers: SyntaxToken<SyntaxKind.Identifier>[] = [];
    while (true) {
      const token = this.matchToken(SyntaxKind.Identifier);
      identifiers.push(token);
      this.skipSingleLineTrivia();
      const next = this.advance();
      if (next.kind !== SyntaxKind.CommaToken) {
        break;
      }
    }
    this.skipSingleLineTrivia();
    this.matchToken(SyntaxKind.SemicolonToken);

    return new VariableDeclartionNode(pos, this.getText(pos, this.pos), varToken, identifiers);
  }

  private parseProcedureDeclaration(): ProcedureDeclarationNode {
    throw new Error('Not implemented yet');
  }

  private parseStatement(): StatementNode {
    throw new Error('Not implemented yet');
  }

  public parseExpression(): ExpressionNode {
    if (this.currentToken.kind === SyntaxKind.NumericLiteral) {
      const nextToken = this.peekIgnoringSingleLineWhitespaceTrivia(1);
      if (nextToken && isArithmeticOperatorToken(nextToken)) {
        return this.parseArithmeticExpression();
      }
    }
    return this.parsePrimaryExpression();
  }

  private parsePrimaryExpression(): ExpressionNode {
    switch (this.currentToken.kind) {
      case SyntaxKind.OpenParenthesisToken:
        return this.parseParenthesizedExpression();
      case SyntaxKind.Identifier:
        return this.parseIdentifierExpression();
    }
    return this.parseNumericLiteralExpression();
  }

  private parseParenthesizedExpression(): ParenthesizedExpressionNode {
    const pos = this.pos;
    const openParenthesisToken = this.matchToken(SyntaxKind.OpenParenthesisToken);
    this.skipSingleLineTrivia();
    const expression = this.parseExpression();
    this.skipSingleLineTrivia();
    const closeParenthesisToken = this.matchToken(SyntaxKind.CloseParenthesisToken);
    return new ParenthesizedExpressionNode(
      pos,
      this.getText(pos, this.pos),
      openParenthesisToken,
      expression,
      closeParenthesisToken
    );
  }

  private parseArithmeticExpression(parentPrecedence = 0): ExpressionNode {
    const pos = this.pos;
    let left = this.parsePrimaryExpression();
    while (true) {
      this.skipSingleLineTrivia();
      const operatorToken = this.currentToken;
      const precedence = getArithmeticOperatorPrecedence(operatorToken.kind);
      if (precedence === 0 || precedence <= parentPrecedence) {
        break;
      }
      this.advance();
      this.skipSingleLineTrivia();
      const right = this.parseArithmeticExpression(precedence);
      left = new ArithmeticExpressionNode(
        pos,
        this.getText(pos, this.pos),
        left,
        operatorToken as SyntaxToken<ArithmeticOperatorTokenSyntaxKind>,
        right
      );
    }

    return left;
  }

  private parseNumericLiteralExpression(): NumericLiteralExpressionNode {
    const pos = this.pos;
    const numericLiteralToken = this.matchToken(SyntaxKind.NumericLiteral);
    this.skipSingleLineTrivia();
    return new NumericLiteralExpressionNode(pos, this.getText(pos, this.pos), numericLiteralToken);
  }

  private parseIdentifierExpression(): IdentifierExpressionNode {
    const pos = this.pos;
    const identifierToken = this.matchToken(SyntaxKind.Identifier);
    this.skipSingleLineTrivia();
    return new IdentifierExpressionNode(pos, this.getText(pos, this.pos), identifierToken);
  }

  private skipSingleLineTrivia(): void {
    while (this.currentToken.kind === SyntaxKind.WhitespaceTrivia) {
      this.advance();
    }
  }

  private skipTrivia(): void {
    while (this.currentToken.kind === SyntaxKind.WhitespaceTrivia
      || this.currentToken.kind === SyntaxKind.NewlineTrivia
    ) {
      this.advance();
    }
  }

  private matchToken<T extends SyntaxKind>(kind: T): SyntaxToken<T> {
    if (this.currentToken.kind === kind) {
      return this.advance() as SyntaxToken<T>;
    }
    this.diagnostics.push({
      pos: this.pos,
      message: `Expected ${SyntaxKind[this.currentToken.kind]}, but received ${SyntaxKind[kind]}`
    });

    return new SyntaxToken(kind);
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

  private peek(by: number): SyntaxToken | undefined {
    return this.tokens[this.index + by];
  }

  private peekIgnoringSingleLineWhitespaceTrivia(by: number): SyntaxToken | undefined {
    while (true) {
      const token = this.peek(by++);
      if (!token) return undefined;
      if (token.kind !== SyntaxKind.WhitespaceTrivia) return token;
    }
  }

  private getText(start: number, end: number): string {
    return this.lexer.text.slice(start, end);
  }
}