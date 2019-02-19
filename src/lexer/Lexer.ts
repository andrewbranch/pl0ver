import { SyntaxKind } from './SyntaxKind';
import { SyntaxToken } from './SyntaxToken';
import { isSingleLineWhitespaceCharacter, isNewlineCharacter, isNumeral, isLetter, isIdentifierCharacter } from '../util/text';

export class Lexer {
  private position = 0;
  public text = '';

  constructor(text: string) {
    this.setText(text);
  }

  public lex(): SyntaxToken {
    if (this.position >= this.text.length) {
      return new SyntaxToken(SyntaxKind.EOFToken);
    }

    let text = this.advance();
    let kind = SyntaxKind.BadToken;

    // Tokens
    if (text === '(') {
      kind = SyntaxKind.OpenParenthesisToken;
    } else if (text === ')') {
      kind = SyntaxKind.CloseParenthesisToken;
    } else if (text === ',') {
      kind = SyntaxKind.CommaToken;
    } else if (text === '.') {
      kind = SyntaxKind.DotToken;
    } else if (text === '>') {
      if (this.getText() === '=') {
        text += this.advance();
        kind = SyntaxKind.GreaterThanEqualToken;
      } else {
        kind = SyntaxKind.GreaterThanToken;
      }
    } else if (text === '<') {
      if (this.getText() === '=') {
        text += this.advance();
        kind = SyntaxKind.LessThanEqualToken;
      } else {
        kind = SyntaxKind.LessThanToken;
      }
    } else if (text === '#') {
      kind = SyntaxKind.HashToken;
    } else if (text === ':') {
      if (this.getText() === '=') {
        text += this.advance();
        kind = SyntaxKind.ColonEqualToken;
      }
    } else if (text === '=') {
      kind = SyntaxKind.EqualToken;
    } else if (text === '-') {
      kind = SyntaxKind.MinusToken;
    } else if (text === '+') {
      kind = SyntaxKind.PlusToken;
    } else if (text === '*') {
      kind = SyntaxKind.StarToken;
    } else if (text === '/') {
      kind = SyntaxKind.SlashToken;
    } else if (text === ';') {
      kind = SyntaxKind.SemicolonToken;
    } else if (text === '?') {
      kind = SyntaxKind.QuestionToken;
    }

    // Trivia
    else if (isSingleLineWhitespaceCharacter(text)) {
      kind = SyntaxKind.WhitespaceTrivia;
      text += this.lexWhitespaceTrivia();
    } else if (isNewlineCharacter(text)) {
      kind = SyntaxKind.NewlineTrivia;
      text += this.lexNewlineTrivia();
    }

    // Literals
    else if (isNumeral(text)) {
      kind = SyntaxKind.NumericLiteral;
      text += this.lexNumericLiteral();
    }

    // Keywords and identifiers
    else if (isLetter(text)) {
      text += this.lexIdentifier();
      switch (text.toLowerCase()) {
        case 'begin':
          kind = SyntaxKind.BeginKeyword;
          break;
        case 'call':
          kind = SyntaxKind.CallKeyword;
          break;
        case 'const':
          kind = SyntaxKind.ConstKeyword;
          break;
        case 'do':
          kind = SyntaxKind.DoKeyword;
          break;
        case 'end':
          kind = SyntaxKind.EndKeyword;
          break;
        case 'if':
          kind = SyntaxKind.IfKeyword;
          break;
        case 'odd':
          kind = SyntaxKind.OddKeyword;
          break;
        case 'procedure':
          kind = SyntaxKind.ProcedureKeyword;
          break;
        case 'then':
          kind = SyntaxKind.ThenKeyword;
          break;
        case 'while':
          kind = SyntaxKind.WhileKeyword;
          break;
        case 'var':
          kind = SyntaxKind.VarKeyword;
          break;
        default:
          kind = SyntaxKind.Identifier;
      }
    }

    return new SyntaxToken(kind, text);
  }

  private setText(text: string) {
    this.text = text;
  }

  private getText(length = 1) {
    return this.text.slice(this.position, this.position + length);
  }

  private advanceWhile(predicate: (text: string) => boolean): string {
    let text = '';
    while (predicate(this.getText())) {
      text += this.advance();
    }
    return text;
  }

  private advance(by = 1): string {
    const text = this.getText(by);
    this.position += by;
    if (this.position > this.text.length) {
      throw new Error('Cannot advance past end of input.');
    }
    return text;
  }

  private lexWhitespaceTrivia(): string {
    return this.advanceWhile(char => isSingleLineWhitespaceCharacter(char));
  }

  private lexNewlineTrivia(): string {
    return this.advanceWhile(char => isNewlineCharacter(char));
  }

  private lexNumericLiteral(): string {
    let text = this.advanceWhile(char => isNumeral(char));
    if (this.getText() === '.') {
      text += this.advance();
      text += this.advanceWhile(char => isNumeral(char));
    }
    return text;
  }

  private lexIdentifier(): string {
    return this.advanceWhile(char => isIdentifierCharacter(char));
  }
}