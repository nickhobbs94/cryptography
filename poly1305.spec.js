import test from 'node:test';
import assert from 'node:assert';
import { octoload, clamp } from './poly1305.js';

const hexify = s => ('0'+s).slice(s.length-1)
const serialise = r => Array.prototype.slice.call(r).map(i => i.toString(16)).map(hexify).join(':');

test('octet parser', () => {
    let desired = new Uint8Array([0x1b, 0xf5, 0x49, 0x41, 0xaf, 0xf6, 0xbf, 0x4a, 0xfd, 0xb2, 0x0d, 0xfb, 0x8a, 0x80, 0x03, 0x01]);
    assert.deepStrictEqual(octoload('01:03:80:8a:fb:0d:b2:fd:4a:bf:f6:af:41:49:f5:1b'), desired);
});

test('clamp r', () => {
    let desired = new Uint8Array([0x08,0x06,0xd5,0x40,0x0e,0x52,0x44,0x7c,0x03,0x6d,0x55,0x54,0x08,0xbe,0xd6,0x85]);
    assert.deepStrictEqual(clamp(octoload('85:d6:be:78:57:55:6d:33:7f:44:52:fe:42:d5:06:a8')), desired);
});
