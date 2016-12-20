const ionicLoadingMock = {
  show: function () {
  },
  hide: function () {
  }
};

const spyOnIonicLoadingMock = () => {
  spyOn(ionicLoadingMock, 'show').and.callThrough();
  spyOn(ionicLoadingMock, 'hide').and.callThrough();
};

export {ionicLoadingMock, spyOnIonicLoadingMock};
