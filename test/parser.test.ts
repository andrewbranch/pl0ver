import { Parser } from "../src/parser/Parser";

describe('Parser', () => {
  it('can parse a simple addition expression', () => {
    const parser = new Parser('3 + 4');
    const tree = parser.parseExpression();
    console.log(tree.visualize());
  });

  it('can parse a more complex addition expression', () => {
    const parser = new Parser('3 + 4 + 5');
    const tree = parser.parseExpression();
    console.log(tree.visualize());
  });

  it('can parse a combination of addition and multiplication with increasing precedence', () => {
    const parser = new Parser('3 + 4 * 5');
    const tree = parser.parseExpression();
    console.log(tree.visualize());
  });

  it('can parse a combination of addition and multiplication with decreasing precedence', () => {
    const parser = new Parser('3 * 4 + 5');
    const tree = parser.parseExpression();
    console.log(tree.visualize());
  });
});
