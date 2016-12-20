const shareSettingsServiceMock = {
  getObj: function () {
    return {
      stepMotorNum: '10'
    };
  }
};

const spyOnShareSettingsServiceMock = () => {
  spyOn(shareSettingsServiceMock, 'getObj').and.callThrough();
};

export {shareSettingsServiceMock, spyOnShareSettingsServiceMock};
