import test from 'node:test';
import assert from 'node:assert';
import { octoload } from './poly1305.js';

test('octet parser', () => {
    let desired = new Uint32Array([0x1bf54941, 0xaff6bf4a, 0xfdb20dfb, 0x8a800301]);
    assert.deepStrictEqual(octoload('01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b'), desired);
});