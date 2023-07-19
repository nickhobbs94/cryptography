import test from 'node:test';
import assert from 'node:assert';
import { toLetter, toNumber, encryptWithKeystream, jokerA, jokerB, advanceJokers, tripleCut, countCut } from './solitaire.js';


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
    const start = [7, 50, 49, 48, 4, 5, 47, 46, 45, 44, 43, 42, 8, 9];
    const end = [5, 47, 46, 45, 44, 43, 42, 8, 7, 50, 49, 48, 4, 9];
    assert.strictEqual(countCut(start).toString(), end.toString());
});
