import { SyntaxKind } from './SyntaxKind';

export class SyntaxToken<T extends SyntaxKind = SyntaxKind> {
  private __debugKind: string | undefined;
  constructor(public kind: T, public value?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.__debugKind = SyntaxKind[kind];
    }
  }
}