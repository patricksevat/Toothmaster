const calculateVarsServiceMock = {
  getVars: function () {
  }
};

const spyOnCalculateServiceMock = () => {
  spyOn(calculateVarsServiceMock, 'getVars').and.callThrough();
};

export {calculateVarsServiceMock, spyOnCalculateServiceMock};
