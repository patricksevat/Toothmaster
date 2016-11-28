import crc16 from '../crc16';

export default function crcService() {
  const crcService = this;

  crcService.appendCRC = function (str) {
    let crc = crc16(str);
    str += String.fromCharCode(crc.Uint8High) + String.fromCharCode(crc.Uint8Low) ;
    return str;
  }
}
