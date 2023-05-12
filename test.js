import test from 'node:test';

function rol(num, shift) {
  return (num << shift) | (num >>> (32 - shift));
}

function hex(n) {
  const s = ('00000000' + (n < 0 ? n + 0xffffffff : n).toString(16));
  return s.slice(s.length-8,s.length);
}

function quarterRoundCalc(vec) {
  vec.a += vec.b;
  vec.a &= 0xffffffff;
  vec.d ^= vec.a;
  vec.d = rol(vec.d, 16);

  vec.c += vec.d;
  vec.c &= 0xffffffff
  vec.b ^= vec.c;
  vec.b = rol(vec.b, 12);

  vec.a += vec.b;
  vec.a &= 0xffffffff
  vec.d ^= vec.a;
  vec.d = rol(vec.d, 8);

  vec.c += vec.d;
  vec.c &= 0xffffffff
  vec.b ^= vec.c;
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

function add(stateA, stateB) {
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
  // state = add(state, initialState);
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

