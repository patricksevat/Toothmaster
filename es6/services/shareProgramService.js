export default function(bugout, $ionicPopup, $state) {
  const shareProgram = this;
  shareProgram.getObj = getObj;
  shareProgram.setObj = setObj;
  shareProgram.checkProgram = checkProgram;

  shareProgram.program = {};

  function getObj() {
    //This is needed for test when no program is selected yet.
    //Start position is needed for initial settings commands
    if (shareProgram.program.startPosition === undefined) {
      bugout.bugout.log('shareProgram.program is undefined, setting start position to nill');
      shareProgram.program.startPosition = 0;
    }
    return shareProgram.program;
  }

  function setObj(value) {
    shareProgram.program = value;
  }

  const redirectButton = [{
    text: 'Go to program',
    type: 'button-calm',
    onTap: function () {
      $state.go('app.program');
    }
  }];

  const okButton = [{
    text: 'Ok',
    type: 'button-calm'
  }];

  function checkProgram(redirectToProgram) {
    if (shareProgram.program.sawWidth === undefined || shareProgram.program.cutWidth === undefined
      || shareProgram.program.pinWidth === undefined || shareProgram.program.numberOfCuts === undefined) {
      $ionicPopup.alert({
        title: 'Please fill in your Program before continuing',
        buttons: redirectToProgram ? redirectButton : okButton
      });
    }
    else if (shareProgram.program.sawWidth > shareProgram.program.cutWidth) {
      $ionicPopup.alert({
        title: 'Your saw width cannot be wider than your cut width',
        template: 'Please adjust your program',
        buttons: redirectToProgram ? redirectButton : okButton
      });
    }
    else if (shareProgram.program.numberOfCuts % 1 !== 0) {
      $ionicPopup.alert(
        {
          title: 'Number of cuts cannot be a floating point',
          template: 'Please make sure that the number of cuts is a whole number. "2" is correct, "2.2" is incorrect.'
        }
      )
    }
    else if (shareProgram.program.sawWidth > 0 && shareProgram.program.cutWidth > 0
      && shareProgram.program.pinWidth > 0 && shareProgram.program.numberOfCuts > 0
      && shareProgram.program.startPosition >= 0)
      return true;
  }
}
