import { SyntaxKind } from "../lexer/SyntaxKind";

export function getArithmeticOperatorPrecedence(kind: SyntaxKind) {
  switch (kind) {
    case SyntaxKind.StarToken:
    case SyntaxKind.SlashToken:
      return 2;
    case SyntaxKind.PlusToken:
    case SyntaxKind.MinusToken:
      return 1;
    default:
      return 0;
  }
}
