import test from 'node:test';
import assert from 'node:assert';

const MASK = 0xffffffff;

function hex(n) {
  const s = ('00000000' + (n).toString(16));
  return s.slice(s.length-8,s.length);
}

function rol(num, shift) {
  return ((num << shift) | (num >>> (32 - shift)));
}

function add(x,y) {
  return (x+y);
}

function xor(x,y) {
  return (x^y);
}

function print(state){
  let str = '';
  for (let i=0; i<16; i++){
    if (i%4===0) str += '\n';
    str += hex(state[i]) + ' ';
  }
  console.log(str);
}

function quarterRound(slice, state){
  state[slice[0]] = add(state[slice[0]], state[slice[1]]);
  state[slice[3]] = xor(state[slice[3]], state[slice[0]]);
  state[slice[3]] = rol(state[slice[3]], 16);

  state[slice[2]] = add(state[slice[2]], state[slice[3]]);
  state[slice[1]] = xor(state[slice[1]], state[slice[2]]);
  state[slice[1]] = rol(state[slice[1]], 12);

  state[slice[0]] = add(state[slice[0]], state[slice[1]]);
  state[slice[3]] = xor(state[slice[3]], state[slice[0]]);
  state[slice[3]] = rol(state[slice[3]], 8);

  state[slice[2]] = add(state[slice[2]], state[slice[3]]);
  state[slice[1]] = xor(state[slice[1]], state[slice[2]]);
  state[slice[1]] = rol(state[slice[1]], 7);
  return state;
}

function addState(stateA, stateB) {
  const newState = [];
  for (let i=0; i<16; i++) {
    newState.push((stateA[i] + stateB[i]) & MASK);
  }
  return newState;
}

function do20ChaChaRounds(state){
  const initialState = state.slice();
  for (let i=0; i<10; i++){
    state = quarterRound([0,4,8,12], state);
    state = quarterRound([1, 5, 9, 13], state);
    state = quarterRound([2, 6, 10, 14], state);
    state = quarterRound([3, 7, 11, 15], state);
    state = quarterRound([0, 5, 10, 15], state);
    state = quarterRound([1, 6, 11, 12], state);
    state = quarterRound([2, 7, 8, 13], state);
    state = quarterRound([3, 4, 9, 14], state);
  }
  // state = addState(state, initialState);
  return state;
}

export function chaCha20(state) {
  const originalState = state.slice();
  state = do20ChaChaRounds(state);
  for (let i=0; i<16; i++) {
    state[i] = add(state[i], originalState[i]);
  }
  return state;
}

test('addition works', () => {
  const state = new Uint32Array([0x77777777,0x01234567]);
  state[0] = add(state[0], state[1]);

  assert.strictEqual(state[0], 0x789abcde);
});

test('xor works', () => {
  const state = new Uint32Array([0x01020304,0x789abcde]);
  state[0] = xor(state[0], state[1]);

  assert.strictEqual(state[0], 0x7998bfda);
});

test('rol works', () => {
  const state = new Uint32Array([0x7998bfda]);
  state[0] = rol(state[0], 7);

  assert.strictEqual(state[0], 0xcc5fed3c);
});

test('rol works 16', () => {
  const state = new Uint32Array([0xfabcdeff]);
  state[0] = rol(state[0], 16);

  assert.strictEqual(state[0], 0xDEFFFABC);
});

test('quarter round', () => {
  let state = new Uint32Array([
    0x879531e0,  0xc5ecf37d,  0x516461b1,  0xc9a62f8a,
    0x44c20ef3,  0x3390af7f,  0xd9fc690b,  0x2a5f714c,
    0x53372767,  0xb00a5631,  0x974c541a,  0x359e9963,
    0x5c971061,  0x3d631689,  0x2098d9d6,  0x91dbd320,
  ]);

  const slice = [2,7,8,13];

  state = quarterRound(slice, state);

  const desired = new Uint32Array([
    0x879531e0,  0xc5ecf37d,  0xbdb886dc,  0xc9a62f8a,
    0x44c20ef3,  0x3390af7f,  0xd9fc690b,  0xcfacafd2,
    0xe46bea80,  0xb00a5631,  0x974c541a,  0x359e9963,
    0x5c971061,  0xccc07c79,  0x2098d9d6,  0x91dbd320,
  ]);

  assert.deepStrictEqual(state, desired);
});

test('chacha rounds completed', () => {
  let state = new Uint32Array([
    0x61707865,  0x3320646e,  0x79622d32,  0x6b206574,
    0x03020100,  0x07060504,  0x0b0a0908,  0x0f0e0d0c,
    0x13121110,  0x17161514,  0x1b1a1918,  0x1f1e1d1c,
    0x00000001,  0x09000000,  0x4a000000,  0x00000000
  ]);
  state = do20ChaChaRounds(state);

  const desired = new Uint32Array([
    0x837778ab,  0xe238d763,  0xa67ae21e,  0x5950bb2f,
    0xc4f2d0c7,  0xfc62bb2f,  0x8fa018fc,  0x3f5ec7b7,
    0x335271c2,  0xf29489f3,  0xeabda8fc,  0x82e46ebd,
    0xd19c12b4,  0xb04e16de,  0x9e83d0cb,  0x4e3c50a2,
  ]);

  assert.deepStrictEqual(state, desired);
});

test('chacha20 full', () => {
  let state = new Uint32Array([
    0x61707865,  0x3320646e,  0x79622d32,  0x6b206574,
    0x03020100,  0x07060504,  0x0b0a0908,  0x0f0e0d0c,
    0x13121110,  0x17161514,  0x1b1a1918,  0x1f1e1d1c,
    0x00000001,  0x09000000,  0x4a000000,  0x00000000
  ]);
  state = chaCha20(state);

  const desired = new Uint32Array([
    0xe4e7f110,  0x15593bd1,  0x1fdd0f50,  0xc47120a3,
    0xc7f4d1c7,  0x0368c033,  0x9aaa2204,  0x4e6cd4c3,
    0x466482d2,  0x09aa9f07,  0x05d7c214,  0xa2028bd9,
    0xd19c12b5,  0xb94e16de,  0xe883d0cb,  0x4e3c50a2,
  ]);

  assert.deepStrictEqual(state, desired);
});