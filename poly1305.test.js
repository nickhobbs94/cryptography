import test from 'node:test';
import assert from 'node:assert';
import { octoload, clamp, encodeString, blockClearText } from './poly1305.js';

const hexify = s => ('0'+s).slice(s.length-1)
const serialise = r => Array.prototype.slice.call(r).map(i => i.toString(16)).map(hexify).join(':');

test('octet parser', () => {
    const desired = 0x1bf54941aff6bf4afdb20dfb8a800301n;
    assert.deepStrictEqual(octoload('01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b'), desired);
});

test('clamp r', () => {
    const desired = 0x806d5400e52447c036d555408bed685n;
    assert.deepStrictEqual(clamp(octoload('85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8')), desired);
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
    assert.deepStrictEqual((blockClearText(message)[0]), desired);
});

test('second block is correct', () => {
    const message = 'Cryptographic Forum Research Group';
    const desired = 0x6f7247206863726165736552206d7572n;
    assert.deepStrictEqual((blockClearText(message)[1]), desired);
});

test('final block is correct', () => {
    const message = 'Cryptographic Forum Research Group';
    const desired = 0x7075n;
    assert.deepStrictEqual((blockClearText(message)[2]), desired);
});

// // test('simple test', () => {
// //     const key = '85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8:01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b';
// //     const s = '01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b';
// //     const r = '85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8';
// //     const message = 'Cryptographic Forum Research Group';
// // });
