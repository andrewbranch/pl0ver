import { SyntaxKind } from './SyntaxKind';

export class SyntaxToken {
  private __debugKind: string | undefined;
  constructor(public kind: SyntaxKind, public value?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.__debugKind = SyntaxKind[kind];
    }
  }
}