// poly1305

function uintArrayToBigInt(arr) {
    let result = BigInt(0);
    for (let n of arr) {
        result = result * 0x100n + BigInt(n);
    }
    return result;
}

export function octoload(str) {
    let inputs = str.split(':').reverse().map(s => BigInt('0x'+s));
    return uintArrayToBigInt(inputs);
}

export function clamp(r) {
    return r & 0x0ffffffc0ffffffc0ffffffc0fffffffn;
}

export function encodeString(s) {
    const encoder = new TextEncoder();
    return encoder.encode(s);
}

const BLOCK_LENGTH = 16;

export function blockClearText(s) {
    const result = [];
    const encoded = encodeString(s);
    for (let i=0; i<Math.ceil(encoded.length / BLOCK_LENGTH); i++) {
        const section = encoded.slice(i*BLOCK_LENGTH, (i+1)*BLOCK_LENGTH).reverse();
        result.push(uintArrayToBigInt(section));
    }
    return result;
}

export function addBitAboveHighest(n) {
    let i = 0n;
    while (n >> i > 0) i += 8n;
    return n + (1n << i);
}

const P = 2n ** 130n - 5n;

export function updateAccumulator(acc, block, r) {
    const paddedBlock = addBitAboveHighest(block);
    return ((acc+paddedBlock)*r) % P;
}

const hexify = s => ('0'+s).slice(s.length-1)
// const serialise = r => Array.prototype.slice.call(r).map(i => i.toString(16)).map(hexify).join(':');

function serialise128bits(n) {
    let result = [];
    for (let i=0; i<16; i++) {
        result.push(hexify((n & 0xffn).toString(16)));
        n >>= 8n;
    }
    return result.join(':');
}

export function poly1305(sEncoded, rEncoded, messageRaw) {
    const s = octoload(sEncoded);
    const r = clamp(octoload(rEncoded));
    const blocks = blockClearText(messageRaw);
    let acc = 0n;
    for (let block of blocks) {
        acc = updateAccumulator(acc, block, r);
    }
    return serialise128bits(s + acc);
}
