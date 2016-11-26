export default function(bugout) {
  const shareProgram = this;
  shareProgram.getObj = getObj;
  shareProgram.setObj = setObj;
  
  shareProgram.obj = {
    "program": {}
  };

  function getObj() {
    if (shareProgram.obj.program.startPosition === undefined) {
      bugout.bugout.log('shareProgram.obj.program is undefined, setting start position to nill');
      shareProgram.obj.program.startPosition = 0;
    }
    return shareProgram.obj.program;
  }
  
  function setObj(value) {
    shareProgram.obj.program = value;
  }
}
