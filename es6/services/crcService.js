import crc16 from '../crc16';

export default function crcService() {
  const crcService = this;

  crcService.appendCRC = function (str) {
    let crc = crc16(str);
    let high = crc.Uint8High === 0 ? 1 : crc.Uint8High;
    let low = crc.Uint8Low === 0 ? 1 : crc.Uint8Low;
    
    return str + String.fromCharCode(high) + String.fromCharCode(low) ;
  }
}
