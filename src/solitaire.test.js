import test from 'node:test';
import assert from 'node:assert';
import { advanceSpecificJoker, generateKeystream, toLetter, toNumber, encryptWithKeystream, jokerA, jokerB, advanceJokers, tripleCut, countCut, cards } from './solitaire.js';


test('first letter', () => {
    assert.strictEqual(toLetter(1), 'A');
});

test('last letter', () => {
    assert.strictEqual(toLetter(26), 'Z');
});

test('middle letter', () => {
    assert.strictEqual(toLetter(10), 'J');
});

test('zero letter', () => {
    assert.strictEqual(toLetter(0), 'Z');
});

test('negative letter', () => {
    assert.strictEqual(toLetter(-1), 'Y');
});

test('wraparound letter', () => {
    assert.strictEqual(toLetter(27), 'A');
});

test('from first letter to number', () => {
    assert.strictEqual(toNumber('A'), 1);
});

test('from middle letter to number', () => {
    assert.strictEqual(toNumber('J'), 10);
});

test('invertible from 1 to 26', () => {
    for (let i=1; i<=26; i++) {
        assert.strictEqual(toNumber(toLetter(i)), i);
    }
});

test('coimage from 0 to 25', () => {
    for (let i=-100; i<100; i++) {
        const y = toNumber(toLetter(i));
        assert.ok(y >= 1 && y <= 26);
    }
});

test('encryption example works', () => {
    const result = encryptWithKeystream("DONOTUSEPC", "KDWUPONOWT");
    const desired = "OSKJJJGTMW";
    assert.strictEqual(result, desired);
});

test('adding Z is adding zero', () => {
    const result = encryptWithKeystream("A", "Z");
    const desired = "A";
    assert.strictEqual(result, desired);
});

test('can get from Z to Y', () => {
    const result = encryptWithKeystream("Z", "Y");
    const desired = "Y";
    assert.strictEqual(result, desired);
});

test('advance jokers example 1', () => {
    const start = [jokerA, 7, 2, jokerB, 9, 4, 1];
    const end = [7, jokerA, 2, 9, 4, jokerB, 1];
    assert.strictEqual(advanceJokers(start).toString(), end.toString());
});

test('advance jokers example 2', () => {
    const start = [3, jokerA, jokerB, 8, 9, 6];
    const end = [3, jokerA, 8, jokerB, 9, 6];
    assert.strictEqual(advanceJokers(start).toString(), end.toString());
});

test('advance joker to end', () => {
    const start = [1, 2, 3, jokerA, jokerB];
    const end = [1, 2, 3, jokerB, jokerA];
    assert.strictEqual(advanceSpecificJoker(start, jokerA, 1).toString(), end.toString());
});

test('advance jokers past end 1', () => {
    const start = [1, 2, 3, jokerA];
    const end = [1, jokerA, 2, 3];
    assert.strictEqual(advanceSpecificJoker(start, jokerA, 1).toString(), end.toString());
});

test('advance jokers past end 2', () => {
    const start = [1, 2, 3, jokerA, jokerB];
    const end = [1, 2, jokerB, 3, jokerA];
    assert.strictEqual(advanceSpecificJoker(start, jokerB, 2).toString(), end.toString());
});

test('triple cut example 1', () => {
    const start = [2, 4, 6, jokerB, 5, 8, 7, 1, jokerA, 3, 9];
    const end = [3, 9, jokerB, 5, 8, 7, 1, jokerA, 2, 4, 6];
    assert.strictEqual(tripleCut(start).toString(), end.toString());
});

test('triple cut example 2', () => {
    const start = [jokerB, 5, 8, 7, 1, jokerA, 3, 9];
    const end = [3, 9, jokerB, 5, 8, 7, 1, jokerA];
    assert.strictEqual(tripleCut(start).toString(), end.toString());
});

test('triple cut example 3', () => {
    const start = [jokerB, 5, 8, 7, 1, jokerA];
    const end = [jokerB, 5, 8, 7, 1, jokerA];
    assert.strictEqual(tripleCut(start).toString(), end.toString());
});

test('count cut example 1', () => {
    const start = [7, 50, 49, 48, 47, 46, 45, 44, 4, 5, 43, 42, 8, 9];
    const end = [5, 43, 42, 8, 7, 50, 49, 48, 47, 46, 45, 44, 4, 9];
    assert.strictEqual(countCut(start).toString(), end.toString());
});


const range = (n,m) => Array.from(Array(m-n).keys()).map(x => x+n);

test('unkeyed deck is correct', () => {
    const deck = cards.slice();
    assert.strictEqual(deck.toString(), [...range(1,53), jokerA, jokerB].toString());
});

test('unkeyed deck first advance joker', () => {
    const deck = cards.slice();
    const result = advanceSpecificJoker(deck, jokerA, 1);
    const expected = [...range(1,53), jokerB, jokerA]
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck second advance joker', () => {
    const deck = [...range(1,53), jokerB, jokerA];
    const result = advanceSpecificJoker(deck, jokerB, 2);
    const expected = [1, jokerB, ...range(2, 53), jokerA];
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck triple cut', () => {
    const deck = [1, jokerB, ...range(2, 53), jokerA];
    const result = tripleCut(deck);
    const expected = [jokerB, ...range(2, 53), jokerA, 1];
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck count cut', () => {
    const deck = [jokerB, ...range(2, 53), jokerA, 1];
    const result = countCut(deck);
    const expected = [...range(2, 53), jokerA, jokerB, 1];
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck first output', () => {
    const deck = cards.slice();
    const result = generateKeystream(deck, 1);
    assert.strictEqual(result.output, 'D');
});

test('unkeyed deck first resulting deck state', () => {
    const deck = cards.slice();
    const result = generateKeystream(deck, 1);
    const expected = [...Array.from(Array(51).keys()).map(n => n+2), jokerA, jokerB, 1];
    assert.strictEqual(result.deck.toString(), expected.toString());
});

test('first ten outputs', () => {
    const deck = cards.slice();
    const expected = [4, 49, 10, 24, 8, 51, 44, 6, 4, 33].map(n => toLetter(n)).join('');
    const result = generateKeystream(deck, 10);
    assert.strictEqual(result.output, expected);
});
