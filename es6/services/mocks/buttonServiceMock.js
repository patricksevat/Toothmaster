const buttonServiceMock = {
  getValues: function () {
  }
};

const spyOnButtonServiceMock = () => {
  spyOn(buttonServiceMock, 'getValues').and.callThrough();
};

export {buttonServiceMock, spyOnButtonServiceMock};
