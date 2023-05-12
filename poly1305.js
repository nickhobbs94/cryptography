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

