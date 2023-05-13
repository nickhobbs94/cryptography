import test from 'node:test';
import assert from 'node:assert';
import { octoload, clamp, encodeString, blockClearText, addBitAboveHighest, updateAccumulator, poly1305 } from './poly1305.js';

test('octet parser', () => {
    const desired = 0x1bf54941aff6bf4afdb20dfb8a800301n;
    assert.strictEqual(octoload('01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b'), desired);
});

test('clamp r', () => {
    const desired = 0x806d5400e52447c036d555408bed685n;
    assert.strictEqual(clamp(octoload('85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8')), desired);
});

test('encoder right format', () => {
    const message = 'Cryptographic Forum Research Group';
    assert.strictEqual(encodeString(message).length, 34);
});

test('block cleartext into 3 blocks when 34 bytes long', () => {
    const message = 'Cryptographic Forum Research Group';
    assert.strictEqual(blockClearText(message).length, 3);
});

test('first block is correct', () => {
    const message = 'Cryptographic Forum Research Group';
    const desired = 0x6f4620636968706172676f7470797243n;
    assert.strictEqual((blockClearText(message)[0]), desired);
});

test('second block is correct', () => {
    const message = 'Cryptographic Forum Research Group';
    const desired = 0x6f7247206863726165736552206d7572n;
    assert.strictEqual((blockClearText(message)[1]), desired);
});

test('final block is correct', () => {
    const message = 'Cryptographic Forum Research Group';
    const desired = 0x7075n;
    assert.strictEqual((blockClearText(message)[2]), desired);
});

test('appending 0x01 is correct to full length', () => {
    const initial = 0x7075n;
    const desired = 0x017075n;
    assert.strictEqual(addBitAboveHighest(initial), desired);
});

test('appending 0x01 is correct to shorter length', () => {
    const initial = 0x6f4620636968706172676f7470797243n;
    const desired = 0x016f4620636968706172676f7470797243n;
    assert.strictEqual(addBitAboveHighest(initial), desired);
});

test('first block update is correct', () => {
    const acc = 0n;
    const block = 0x6f4620636968706172676f7470797243n;
    const r = 0x806d5400e52447c036d555408bed685n;
    const desired = 0x2c88c77849d64ae9147ddeb88e69c83fcn;
    assert.strictEqual(updateAccumulator(acc, block, r), desired);
});

test('last block update is correct', () => {
    const acc = 0x2d8adaf23b0337fa7cccfb4ea344b30den;
    const block = 0x7075n;
    const r = 0x806d5400e52447c036d555408bed685n;
    const desired = 0x28d31b7caff946c77c8844335369d03a7n;
    assert.strictEqual(updateAccumulator(acc, block, r), desired);
});

test('end to end test', () => {
    // const key = '85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8:01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b';
    const s = '01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b';
    const r = '85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8';
    const message = 'Cryptographic Forum Research Group';
    const result = poly1305(s, r, message);
    assert.strictEqual(result, 'a8:06:1d:c1:30:51:36:c6:c2:2b:8b:af:0c:01:27:a9');
});
