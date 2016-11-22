'use strict';

var input = '<f02>';
var output = '<f02>™M';

var crc16 = require('./crc16');

function test() {
  var res = crc16(input);

  console.log(res);
  var high = res.Uint8High;
  var low = res.Uint8Low;

  console.log(String.fromCodePoint(high, low));
}

test();

console.log(output);