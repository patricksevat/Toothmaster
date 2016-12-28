let inputArr = ['<f02>', '<q50381>', '<q32641>'];
let output = '<f02>™M';

let crc16 = require('./crc16');

function test(commands) {
  commands.map((command) => {
    let res = crc16(command);
    let output = command+String.fromCharCode(res.Uint8High)+String.fromCharCode(res.Uint8Low);
    console.log('Input: '+command+', output: '+output+', high: '+res.Uint8High+', low: '+res.Uint8Low);
  });
}

test(inputArr);

