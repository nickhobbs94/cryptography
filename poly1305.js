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
