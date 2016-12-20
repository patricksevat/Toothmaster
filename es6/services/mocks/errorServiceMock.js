const errorServiceMock = {
  addError: function () {
  }
};

const spyOnErrorServiceMock = () => {
  spyOn(errorServiceMock, 'addError').and.callThrough();
};

export {errorServiceMock, spyOnErrorServiceMock};
