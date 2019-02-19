export enum NodeKind {
  Program,

  Block,
  ConstDeclaration,
  ConstAssignment,
  VariableDeclaration,
  ProcedureDeclaration,

  AssignmentStatement,
  CallStatement,
  BlockBodyStatement,
  ConditionalStatement,
  WhileLoopStatement,

  OddCondition,
  ComparisonCondition,

  NumberLiteralExpression,
  IdentifierExpression,
  ArithmeticExpression,
}