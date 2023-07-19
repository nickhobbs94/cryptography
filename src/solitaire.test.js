import test from 'node:test';
import assert from 'node:assert';
import * as cipher from './solitaire.js';

test('first letter', () => {
    assert.strictEqual(cipher.toLetter(1), 'A');
});

test('last letter', () => {
    assert.strictEqual(cipher.toLetter(26), 'Z');
});

test('middle letter', () => {
    assert.strictEqual(cipher.toLetter(10), 'J');
});

test('zero letter', () => {
    assert.strictEqual(cipher.toLetter(0), 'Z');
});

test('negative letter', () => {
    assert.strictEqual(cipher.toLetter(-1), 'Y');
});

test('wraparound letter', () => {
    assert.strictEqual(cipher.toLetter(27), 'A');
});

test('from first letter to number', () => {
    assert.strictEqual(cipher.toNumber('A'), 1);
});

test('from middle letter to number', () => {
    assert.strictEqual(cipher.toNumber('J'), 10);
});

test('invertible from 1 to 26', () => {
    for (let i=1; i<=26; i++) {
        assert.strictEqual(cipher.toNumber(cipher.toLetter(i)), i);
    }
});

test('coimage from 0 to 25', () => {
    for (let i=-100; i<100; i++) {
        const y = cipher.toNumber(cipher.toLetter(i));
        assert.ok(y >= 1 && y <= 26);
    }
});

test('encryption example works', () => {
    const result = cipher.encryptWithKeystream("DONOTUSEPC", "KDWUPONOWT");
    const desired = "OSKJJJGTMW";
    assert.strictEqual(result, desired);
});

test('adding Z is adding zero', () => {
    const result = cipher.encryptWithKeystream("A", "Z");
    const desired = "A";
    assert.strictEqual(result, desired);
});

test('can get from Z to Y', () => {
    const result = cipher.encryptWithKeystream("Z", "Y");
    const desired = "Y";
    assert.strictEqual(result, desired);
});

test('advance jokers example 1', () => {
    const start = [cipher.jokerA, 7, 2, cipher.jokerB, 9, 4, 1];
    const end = [7, cipher.jokerA, 2, 9, 4, cipher.jokerB, 1];
    assert.strictEqual(cipher.advanceJokers(start).toString(), end.toString());
});

test('advance jokers example 2', () => {
    const start = [3, cipher.jokerA, cipher.jokerB, 8, 9, 6];
    const end = [3, cipher.jokerA, 8, cipher.jokerB, 9, 6];
    assert.strictEqual(cipher.advanceJokers(start).toString(), end.toString());
});

test('advance joker to end', () => {
    const start = [1, 2, 3, cipher.jokerA, cipher.jokerB];
    const end = [1, 2, 3, cipher.jokerB, cipher.jokerA];
    assert.strictEqual(cipher.advanceSpecificJoker(start, cipher.jokerA, 1).toString(), end.toString());
});

test('advance jokers past end 1', () => {
    const start = [1, 2, 3, cipher.jokerA];
    const end = [1, cipher.jokerA, 2, 3];
    assert.strictEqual(cipher.advanceSpecificJoker(start, cipher.jokerA, 1).toString(), end.toString());
});

test('advance jokers past end 2', () => {
    const start = [1, 2, 3, cipher.jokerA, cipher.jokerB];
    const end = [1, 2, cipher.jokerB, 3, cipher.jokerA];
    assert.strictEqual(cipher.advanceSpecificJoker(start, cipher.jokerB, 2).toString(), end.toString());
});

test('triple cut example 1', () => {
    const start = [2, 4, 6, cipher.jokerB, 5, 8, 7, 1, cipher.jokerA, 3, 9];
    const end = [3, 9, cipher.jokerB, 5, 8, 7, 1, cipher.jokerA, 2, 4, 6];
    assert.strictEqual(cipher.tripleCut(start).toString(), end.toString());
});

test('triple cut example 2', () => {
    const start = [cipher.jokerB, 5, 8, 7, 1, cipher.jokerA, 3, 9];
    const end = [3, 9, cipher.jokerB, 5, 8, 7, 1, cipher.jokerA];
    assert.strictEqual(cipher.tripleCut(start).toString(), end.toString());
});

test('triple cut example 3', () => {
    const start = [cipher.jokerB, 5, 8, 7, 1, cipher.jokerA];
    const end = [cipher.jokerB, 5, 8, 7, 1, cipher.jokerA];
    assert.strictEqual(cipher.tripleCut(start).toString(), end.toString());
});

test('count cut example 1', () => {
    const start = [7, 50, 49, 48, 47, 46, 45, 44, 4, 5, 43, 42, 8, 9];
    const end = [5, 43, 42, 8, 7, 50, 49, 48, 47, 46, 45, 44, 4, 9];
    assert.strictEqual(cipher.countCut(start).toString(), end.toString());
});


const range = (n,m) => Array.from(Array(m-n).keys()).map(x => x+n);

test('unkeyed deck is correct', () => {
    const deck = cipher.cards.slice();
    assert.strictEqual(deck.toString(), [...range(1,53), cipher.jokerA, cipher.jokerB].toString());
});

test('unkeyed deck first advance joker', () => {
    const deck = cipher.cards.slice();
    const result = cipher.advanceSpecificJoker(deck, cipher.jokerA, 1);
    const expected = [...range(1,53), cipher.jokerB, cipher.jokerA]
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck second advance joker', () => {
    const deck = [...range(1,53), cipher.jokerB, cipher.jokerA];
    const result = cipher.advanceSpecificJoker(deck, cipher.jokerB, 2);
    const expected = [1, cipher.jokerB, ...range(2, 53), cipher.jokerA];
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck triple cut', () => {
    const deck = [1, cipher.jokerB, ...range(2, 53), cipher.jokerA];
    const result = cipher.tripleCut(deck);
    const expected = [cipher.jokerB, ...range(2, 53), cipher.jokerA, 1];
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck count cut', () => {
    const deck = [cipher.jokerB, ...range(2, 53), cipher.jokerA, 1];
    const result = cipher.countCut(deck);
    const expected = [...range(2, 53), cipher.jokerA, cipher.jokerB, 1];
    assert.strictEqual(result.toString(), expected.toString());
});

test('unkeyed deck first output', () => {
    const deck = cipher.cards.slice();
    const result = cipher.generateKeystream(deck, 1);
    assert.strictEqual(result.output, 'D');
});

test('unkeyed deck first resulting deck state', () => {
    const deck = cipher.cards.slice();
    const result = cipher.generateKeystream(deck, 1);
    const expected = [...Array.from(Array(51).keys()).map(n => n+2), cipher.jokerA, cipher.jokerB, 1];
    assert.strictEqual(result.deck.toString(), expected.toString());
});

test('first ten outputs', () => {
    const deck = cipher.cards.slice();
    const expected = [4, 49, 10, 24, 8, 51, 44, 6, 4, 33].map(n => cipher.toLetter(n)).join('');
    const result = cipher.generateKeystream(deck, 10);
    assert.strictEqual(result.output, expected);
});

// now to test the inverse functions

test('inverse unkeyed deck count cut', () => {
    const deck = [cipher.jokerB, ...range(2, 53), cipher.jokerA, 1];
    const expected = [...range(2, 53), cipher.jokerA, cipher.jokerB, 1];
    const result = cipher.inverseCountCut(expected);
    assert.strictEqual(result.toString(), deck.toString());
});

test('inverse count cut example 1', () => {
    const start = [7, 50, 49, 48, 47, 46, 45, 44, 4, 5, 43, 42, 8, 9];
    const end = [5, 43, 42, 8, 7, 50, 49, 48, 47, 46, 45, 44, 4, 9];
    assert.strictEqual(cipher.inverseCountCut(end).toString(), start.toString());
});

test('inverse triple cut example 1', () => {
    const start = [2, 4, 6, cipher.jokerB, 5, 8, 7, 1, cipher.jokerA, 3, 9];
    const end = [3, 9, cipher.jokerB, 5, 8, 7, 1, cipher.jokerA, 2, 4, 6];
    assert.strictEqual(cipher.inverseTripleCut(end).toString(), start.toString());
});

test('inverse triple cut example 2', () => {
    const start = [cipher.jokerB, 5, 8, 7, 1, cipher.jokerA, 3, 9];
    const end = [3, 9, cipher.jokerB, 5, 8, 7, 1, cipher.jokerA];
    assert.strictEqual(cipher.inverseTripleCut(end).toString(), start.toString());
});

test('inverse triple cut example 3', () => {
    const start = [cipher.jokerB, 5, 8, 7, 1, cipher.jokerA];
    const end = [cipher.jokerB, 5, 8, 7, 1, cipher.jokerA];
    assert.strictEqual(cipher.inverseTripleCut(end).toString(), start.toString());
});

test('inverse advance joker to end', () => {
    const start = [1, 2, 3, cipher.jokerA, cipher.jokerB];
    const end = [1, 2, 3, cipher.jokerB, cipher.jokerA];
    assert.strictEqual(cipher.advanceSpecificJoker(end, cipher.jokerA, -1).toString(), start.toString());
});

test('inverse joker A movement skips start position', () => {
    const deck = [1, cipher.jokerA, 2, 3, 4];
    const invdeck = [1, 2, 3, 4, cipher.jokerA];
    assert.strictEqual(cipher.advanceSpecificJoker(deck, cipher.jokerA, -1).toString(), invdeck.toString());
});

test('inverse joker B movement skips start position', () => {
    const deck = [1, 2, cipher.jokerB, 3, 4];
    const invdeck = [1, 2, 3, 4, cipher.jokerB];
    assert.strictEqual(cipher.advanceSpecificJoker(deck, cipher.jokerB, -2).toString(), invdeck.toString());
});

test('inverse joker B movement can move to first valid position', () => {
    const deck = [1, 2, 3, cipher.jokerB, 4];
    const invdeck = [1, cipher.jokerB, 2, 3, 4];
    assert.strictEqual(cipher.advanceSpecificJoker(deck, cipher.jokerB, -2).toString(), invdeck.toString());
});
