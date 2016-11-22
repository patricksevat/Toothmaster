let input = '<f02>';
let output = '<f02>™M';

let crc16 = require('./crc16');

function test() {
  let res = crc16(input);

  console.log(res);
  let high = res.Uint8High;
  let low = res.Uint8Low;

  console.log(String.fromCodePoint(high, low));
}

test();

console.log(output);

