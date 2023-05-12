import test from 'node:test';
import assert from 'node:assert';

function hex(n) {
  const s = ('00000000' + (n < 0 ? n + 0x100000000 : n).toString(16));
  return s.slice(s.length-8,s.length);
}

function rol(num, shift) {
  return ((num << shift) | (num >> (32 - shift)));
}

function add(x,y) {
  return (x+y) & 0xffffffff;
}

function xor(x,y) {
  return (x^y);
}

function quarterRoundCalc(vec) {
  vec.a = add(vec.a, vec.b);
  vec.d = xor(vec.d, vec.a);
  vec.d = rol(vec.d, 16);

  vec.c = add(vec.c, vec.d);
  vec.b = xor(vec.b, vec.c);
  vec.b = rol(vec.b, 12);

  vec.a = add(vec.a, vec.b);
  vec.d = xor(vec.d, vec.a);
  vec.d = rol(vec.d, 8);

  vec.c = add(vec.c, vec.d);
  vec.b = xor(vec.b, vec.c);
  vec.b = rol(vec.b, 7);

  return vec;
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
  const a = state[slice[0]];
  const b = state[slice[1]];
  const c = state[slice[2]];
  const d = state[slice[3]];
  const updated = quarterRoundCalc({a,b,c,d});
  state[slice[0]] = updated.a;
  state[slice[1]] = updated.b;
  state[slice[2]] = updated.c;
  state[slice[3]] = updated.d;
  return state;
}

function addState(stateA, stateB) {
  const newState = [];
  for (let i=0; i<16; i++) {
    newState.push((stateA[i] + stateB[i]) & 0xffffffff);
  }
  return newState;
}

export function doChaCha20(state){
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

let state = [
  0x61707865,  0x3320646e,  0x79622d32,  0x6b206574,
  0x03020100,  0x07060504,  0x0b0a0908,  0x0f0e0d0c,
  0x13121110,  0x17161514,  0x1b1a1918,  0x1f1e1d1c,
  0x00000001,  0x09000000,  0x4a000000,  0x00000000
];
print(state);
state = doChaCha20(state);
print(state);

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
  const state = new Uint32Array([0x7998bfda,0x789abcde]);
  state[0] = rol(state[0], 7);

  assert.strictEqual(state[0], 0xcc5fed3c);
});

