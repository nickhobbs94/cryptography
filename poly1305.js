// poly1305

export function octoload(str) {
    let inputs = str.split(':').reverse().map(s => parseInt('0x'+s));
    let result = new Uint8Array(inputs);
    return result;
}

export function clamp(r) {
    r[15-3] &= 15;
    r[15-7] &= 15;
    r[15-11] &= 15;
    r[15-15] &= 15;
    r[15-4] &= 252;
    r[15-8] &= 252;
    r[15-12] &= 252;
    return r;
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
        result.push(encoded.slice(i*BLOCK_LENGTH, (i+1)*BLOCK_LENGTH).reverse());
    }
    return result;
}
