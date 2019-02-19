import { CharCode } from './CharCode';

function assertSingleCharacter(character: string, functionName: string): void {
  if (character.length !== 1) {
    throw new TypeError(`Argument to ‘${functionName}’ must be a single character.`);
  }
}

export function isSingleLineWhitespaceCharacter(character: string): boolean {
  assertSingleCharacter(character, 'isSingleLineWhitespaceCharacter');
  return character === ' ' || character === '\t';
}

export function isNewlineCharacter(character: string): boolean {
  assertSingleCharacter(character, 'isNewlineCharacter');
  return character === '\n' || character === '\r';
}

export function isNumeral(character: string): boolean {
  assertSingleCharacter(character, 'isNumeral');
  const charCode = character.charCodeAt(0);
  return charCode >= CharCode.Zero && charCode <= CharCode.Nine;
}

export function isLetter(character: string): boolean {
  assertSingleCharacter(character, 'isLetter');
  const charCode = character.charCodeAt(0);
  return charCode >= CharCode.a && charCode <= CharCode.z
    || charCode >= CharCode.A && charCode <= CharCode.Z;
}

export function isAlphaNumeric(character: string): boolean {
  return isNumeral(character) || isLetter(character);
}

export function isIdentifierCharacter(character: string): boolean {
  assertSingleCharacter(character, 'isIdentifierCharacter');
  return isAlphaNumeric(character) || character === '_';
}