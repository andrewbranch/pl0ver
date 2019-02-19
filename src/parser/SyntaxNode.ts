import { NodeKind } from './NodeKind';
import { SyntaxToken } from '../lexer/SyntaxToken';
import { SyntaxKind } from '../lexer/SyntaxKind';

export type ComparisonTokenSyntaxKind = SyntaxKind.EqualToken
  | SyntaxKind.HashToken
  | SyntaxKind.LessThanToken
  | SyntaxKind.LessThanEqualToken
  | SyntaxKind.GreaterThanToken
  | SyntaxKind.GreaterThanEqualToken;

export type ArithmeticOperatorTokenSyntaxKind = SyntaxKind.PlusToken
  | SyntaxKind.MinusToken
  | SyntaxKind.StarToken
  | SyntaxKind.SlashToken;

export type ExpressionNode = NumericLiteralExpressionNode | IdentifierExpressionNode | ArithmeticExpressionNode;
export type StatementNode = AssignmentStatementNode | CallStatementNode | BlockBodyStatementNode;
export type ConditionNode = OddConditionNode | ComparisonConditionNode;

export abstract class SyntaxNode {
  constructor(public kind: NodeKind, public pos: number, public text: string) {}
  public abstract readonly children: SyntaxNode[] | undefined;
}

export class ProgramNode extends SyntaxNode {
  public readonly children: BlockNode[];
  constructor(pos: number, text: string, public blocks: BlockNode[]) {
    super(NodeKind.Program, pos, text);
    this.children = blocks;
  }
}

export class BlockNode extends SyntaxNode {
  public children: SyntaxNode[] = [];
  constructor(
    pos: number,
    text: string,
    public constDeclaration: ConstDeclarationNode | undefined,
    public variableDeclaration: VariableDeclartionNode | undefined,
    public procedureDeclarations: ProcedureDeclarationNode[],
    public statement: StatementNode,
  ) {
    super(NodeKind.Block, pos, text);
    if (this.constDeclaration) this.children.push(this.constDeclaration);
    if (this.variableDeclaration) this.children.push(this.variableDeclaration);
    this.children.push(...this.procedureDeclarations);
    this.children.push(this.statement);
  }
}

export class ConstDeclarationNode extends SyntaxNode {
  public readonly children: ConstAssignmentNode[];
  constructor(pos: number, text: string, public assignments: ConstAssignmentNode[]) {
    super(NodeKind.ConstDeclaration, pos, text);
    this.children = assignments;
  }
}

export class ConstAssignmentNode extends SyntaxNode {
  constructor(
    pos: number,
    text: string,
    public identifierToken: SyntaxToken<SyntaxKind.Identifier>,
    public equalToken: SyntaxToken<SyntaxKind.EqualToken>,
    public valueExpression: NumericLiteralExpressionNode,
  ) {
    super(NodeKind.ConstAssignment, pos, text);
  }

  public get children() {
    return undefined;
  }
}

export class VariableDeclartionNode extends SyntaxNode {
  constructor(
    pos: number,
    text: string,
    public identifierTokens: SyntaxToken<SyntaxKind.Identifier>[],
  ) {
    super(NodeKind.VariableDeclaration, pos, text);
  }

  public get children() {
    return undefined;
  }
}

export class ProcedureDeclarationNode extends SyntaxNode {
  public readonly children: [BlockNode];
  constructor(
    pos: number,
    text: string,
    public identifierToken: SyntaxToken<SyntaxKind.Identifier>,
    public block: BlockNode,
  ) {
    super(NodeKind.ProcedureDeclaration, pos, text);
    this.children = [block];
  }
}

export class AssignmentStatementNode extends SyntaxNode {
  public readonly children: [ExpressionNode];
  constructor(
    pos: number,
    text: string,
    public identifierToken: SyntaxToken<SyntaxKind.Identifier>,
    public operatorToken: SyntaxToken<SyntaxKind.ColonEqualToken>,
    public valueExpression: ExpressionNode,
  ) {
    super(NodeKind.AssignmentStatement, pos, text);
    this.children = [valueExpression];
  }
}

export class CallStatementNode extends SyntaxNode {
  constructor(
    pos: number,
    text: string,
    public callKeywordToken: SyntaxToken<SyntaxKind.CallKeyword>,
    public identifierToken: SyntaxToken<SyntaxKind.Identifier>,
  ) {
    super(NodeKind.CallStatement, pos, text);
  }

  public get children() {
    return undefined;
  }
}

export class BlockBodyStatementNode extends SyntaxNode {
  public readonly children: StatementNode[];
  constructor(
    pos: number,
    text: string,
    public beginKeywordToken: SyntaxToken<SyntaxKind.BeginKeyword>,
    public statements: StatementNode[],
    public endKeywordToken: SyntaxToken<SyntaxKind.EndKeyword>,
  ) {
    super(NodeKind.BlockBodyStatement, pos, text);
    this.children = statements;
  }
}

export class ConditionalStatementNode extends SyntaxNode {
  public readonly children: [ConditionNode, StatementNode];
  constructor(
    pos: number,
    text: string,
    public ifKeywordToken: SyntaxToken<SyntaxKind.IfKeyword>,
    public condition: ConditionNode,
    public thenKeywordToken: SyntaxToken<SyntaxKind.ThenKeyword>,
    public statement: StatementNode,
  ) {
    super(NodeKind.ConditionalStatement, pos, text);
    this.children = [condition, statement];
  }
}

export class WhileLoopStatementNode extends SyntaxNode {
  public readonly children: [ConditionNode, StatementNode];
  constructor(
    pos: number,
    text: string,
    public whileKeywordToken: SyntaxToken<SyntaxKind.WhileKeyword>,
    public condition: ConditionNode,
    public doKeywordToken: SyntaxToken<SyntaxKind.DoKeyword>,
    public statement: StatementNode,
  ) {
    super(NodeKind.WhileLoopStatement, pos, text);
    this.children = [condition, statement];
  }
}

export class OddConditionNode extends SyntaxNode {
  public readonly children: [ExpressionNode];
  constructor(
    pos: number,
    text: string,
    public oddKeywordToken: SyntaxToken<SyntaxKind.OddKeyword>,
    public valueExpression: ExpressionNode,
  ) {
    super(NodeKind.OddCondition, pos, text);
    this.children = [valueExpression];
  }
}

export class ComparisonConditionNode extends SyntaxNode {
  public readonly children: [ExpressionNode, ExpressionNode];
  constructor(
    pos: number,
    text: string,
    public leftExpression: ExpressionNode,
    public operatorToken: SyntaxToken<ComparisonTokenSyntaxKind>,
    public rightExpression: ExpressionNode,
  ) {
    super(NodeKind.ComparisonCondition, pos, text);
    this.children = [leftExpression, rightExpression];
  }
}

export class NumericLiteralExpressionNode extends SyntaxNode {
  constructor(
    pos: number,
    text: string,
    public numericLiteralToken: SyntaxToken<SyntaxKind.NumericLiteral>,
  ) {
    super(NodeKind.NumberLiteralExpression, pos, text);
  }

  public get children() {
    return undefined;
  }
}

export class IdentifierExpressionNode extends SyntaxNode {
  constructor(
    pos: number,
    text: string,
    public identifierToken: SyntaxToken<SyntaxKind.Identifier>,
  ) {
    super(NodeKind.IdentifierExpression, pos, text);
  }

  public get children() {
    return undefined;
  }
}

export class ArithmeticExpressionNode extends SyntaxNode {
  public readonly children: [ExpressionNode, ExpressionNode];
  constructor(
    pos: number,
    text: string,
    public leftExpression: ExpressionNode,
    public operatorToken: SyntaxToken<ArithmeticOperatorTokenSyntaxKind>,
    public rightExpression: ExpressionNode,
  ) {
    super(NodeKind.ArithmeticExpression, pos, text);
    this.children = [leftExpression, rightExpression];
  }
}
