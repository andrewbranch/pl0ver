import fs from 'fs';
import path from 'path';
import { Lexer } from '../src/lexer/Lexer';
import { SyntaxToken } from '../src/lexer/SyntaxToken';
import { SyntaxKind } from '../src/lexer/SyntaxKind';

const sample1 = fs.readFileSync(path.join(__dirname, 'fixtures/sample-1.txt'), 'utf8');

describe('Lexer', () => {
  it('works', () => {
    const lexer = new Lexer(sample1);
    const syntaxList: SyntaxToken[] = [];
    while (true) {
      const token = lexer.lex();
      syntaxList.push(token);
      if (token.kind === SyntaxKind.EOFToken) {
        break;
      }
    }

    expect(syntaxList).toMatchSnapshot();
  });
});
