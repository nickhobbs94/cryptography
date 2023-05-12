// poly1305

export function octoload(str) {
    let count = 0;
    let inputs = str.split(':').reverse().map(s => parseInt('0x'+s));
    let result = new Uint32Array(Math.ceil(inputs.length / 4));

    for (let inByte of inputs) {
        const currentIndex = Math.floor(count / 4);
        result[currentIndex] = result[currentIndex] * 0x100 + inByte;
        count++;
    }
    return result;
}


