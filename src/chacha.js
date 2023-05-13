// chacha20

const MASK = 0xffffffff;

export function hex(n) {
  const s = ('00000000' + (n).toString(16));
  return s.slice(s.length-8,s.length);
}

export function rol(num, shift) {
  return ((num << shift) | (num >>> (32 - shift)));
}

export function add(x,y) {
  return (x+y);
}

export function xor(x,y) {
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

export function quarterRound(slice, state){
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

export function do20ChaChaRounds(state){
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
