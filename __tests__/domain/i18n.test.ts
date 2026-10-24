import { dayNoun, pluralForm } from '../../src/shared/i18n/plural';
import { formatDecimal, parseNumber, sanitizeDecimal } from '../../src/shared/lib/numberInput';

describe('pluralForm', () => {
  it.each([
    [1, 'one'],
    [2, 'few'],
    [5, 'many'],
    [11, 'many'],
    [12, 'many'],
    [21, 'one'],
    [22, 'few'],
    [111, 'many'],
  ])('ru %i → %s', (n, form) => {
    expect(pluralForm(n, 'ru')).toBe(form);
  });

  it('uses one/many for English', () => {
    expect(pluralForm(1, 'en')).toBe('one');
    expect(pluralForm(21, 'en')).toBe('many');
  });

  it('builds day nouns', () => {
    expect(dayNoun(3, 'ru')).toBe('дня');
    expect(dayNoun(1, 'en')).toBe('day');
  });
});

describe('numberInput', () => {
  it('sanitizes decimals to a comma with limited digits', () => {
    expect(sanitizeDecimal('12.345')).toBe('12,34');
    expect(sanitizeDecimal('1234567')).toBe('1234');
    expect(sanitizeDecimal('72,5kg', 3)).toBe('72,5');
    // A second separator (typed or pasted) is dropped, not kept as a dot.
    expect(sanitizeDecimal('1.2.3')).toBe('1,23');
    expect(sanitizeDecimal('1,5.')).toBe('1,5');
  });

  it('parses comma and dot decimals, invalid as 0', () => {
    expect(parseNumber('72,5')).toBe(72.5);
    expect(parseNumber('3.5')).toBe(3.5);
    expect(parseNumber('')).toBe(0);
  });

  it('formats decimals per language', () => {
    expect(formatDecimal(72.5, 'ru')).toBe('72,50');
    expect(formatDecimal(70, 'en')).toBe('70');
  });
});
