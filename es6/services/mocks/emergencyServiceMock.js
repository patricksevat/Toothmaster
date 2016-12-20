const emergencyServiceMock = {
  on: function () {

  },
  off: function () {

  }
};

const spyOnEmergencyServiceMock = () => {
  spyOn(emergencyServiceMock, 'on').and.callThrough();
  spyOn(emergencyServiceMock, 'off').and.callThrough();
};

export {emergencyServiceMock, spyOnEmergencyServiceMock};
