const ionicPopupMock = {
  alert: function () {

  }
};

const spyOnIonicPopupMock = () => {
  spyOn(ionicPopupMock, 'alert').and.callThrough();
};

export {ionicPopupMock, spyOnIonicPopupMock};
