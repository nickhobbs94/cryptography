// solitaire
// from https://www.schneier.com/academic/solitaire/

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const posmod = (n, r) => (((n) % r) + r) % r;

export const toLetter = n => alphabet[posmod(n-1, alphabet.length)]

export const toNumber = l => {
    if (!alphabet.includes(l)) {
        throw new Error(`Letter '${l}' not found in alphabet`);
    }
    return posmod(alphabet.indexOf(l), alphabet.length) + 1;
};

export function encryptWithKeystream(cleartext, keystream) {
    if (cleartext.length > keystream.length) {
        throw new Error(`Need more keystream length! ${cleartext.length} > ${keystream.length}`)
    }

    let result = '';
    for (let i=0; i<cleartext.length; i++) {
        const c = cleartext[i];
        const k = keystream[i];
        result += toLetter(toNumber(c) + toNumber(k));
    }

    return result;
}


/* generating the keystream below */
export const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54];

export function shuffle() {
    const deck = cards.slice();
    // from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

export const jokerA = 53;
export const jokerB = 54;

export function advanceSpecificJoker(deck, joker, amount) {
    // if (amount !== 1 && amount !== 2) throw new Error(`not implemented amount = ${amount}`);

    const i = deck.indexOf(joker);
    const cutBeforeRemove = deck.slice(0,i);
    const cutAfterRemove = deck.slice(i+1);

    deck = [...cutBeforeRemove, ...cutAfterRemove];

    const insertIndex = posmod(i + amount - 1, deck.length) + 1;

    let cutBeforeInsert = deck.slice(0,insertIndex);
    let cutAfterInsert = deck.slice(insertIndex);

    if (cutBeforeInsert.length === 0) {
        cutBeforeInsert = cutAfterInsert;
        cutAfterInsert = [];
    }
    deck = [...cutBeforeInsert, joker,...cutAfterInsert];

    return deck;
}

export function advanceJokers(deck) {
    deck = advanceSpecificJoker(deck, jokerA, 1);
    deck = advanceSpecificJoker(deck, jokerB, 2);
    return deck;
}

export function tripleCut(deck) {
    const i = Math.min(deck.indexOf(jokerA), deck.indexOf(jokerB));
    const j = Math.max(deck.indexOf(jokerA), deck.indexOf(jokerB));

    const firstSection = deck.slice(0,i);
    const middleSection = deck.slice(i,j+1);
    const lastSection = deck.slice(j+1);
    return [...lastSection, ...middleSection, ...firstSection];
}

export function countCut(deck) {
    const card = deck.pop();
    const value = Math.min(card, 53);
    const firstSection = deck.slice(0, value);
    const secondSection = deck.slice(value);
    return [...secondSection, ...firstSection, card];
}

export function output(deck) {
    const topCard = deck[0];
    const value = Math.min(topCard, 53);
    return deck[value];
}

export function generateKeystream(deck, length) {
    let result = '';
    while (result.length < length) {
        deck = advanceJokers(deck);
        deck = tripleCut(deck);
        deck = countCut(deck);
        const outputValue = output(deck);
        if (outputValue < 53) {
            result += toLetter(outputValue);
        }
    }
    return {deck, output: result};
}

/* inverse functions */

export function inverseCountCut(deck) {
    const card = deck.pop();
    const value = deck.length - Math.min(card, 53);
    const firstSection = deck.slice(0, value);
    const secondSection = deck.slice(value);
    return [...secondSection, ...firstSection, card];
}

export function inverseTripleCut(deck) {
    return tripleCut(deck); // well that's easy
}

// well damn, this isn't invertible
export function inverseAdvanceJokers(deck) {
    deck = advanceSpecificJoker(deck, jokerB, -2);
    deck = advanceSpecificJoker(deck, jokerA, -1);
    return deck;
}

/* Helper functions for visualisation */
export function formatDeck(deck) {
    const rowlen = 9;
    let result = '';
    for (let i=0; i<deck.length / rowlen; i++) {
        result += deck.slice(i*rowlen, (i+1)*rowlen)
                      .map(e => e.toString())
                      .map(s => (' '+s).slice(s.length-1))
                      .join(' ');
        result += '\n';
    }
    return result;
}
