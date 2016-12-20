const sendAndReceiveServiceMock = {
  subscribe: function () {
  },
  unsubscribe: function () {
  },
  clearBuffer: function () {
    
  }
};

const spyOnSendAndReceiveServiceMock = () => {
  spyOn(sendAndReceiveServiceMock, 'subscribe').and.callThrough();
  spyOn(sendAndReceiveServiceMock, 'unsubscribe').and.callThrough();
  spyOn(sendAndReceiveServiceMock, 'clearBuffer').and.callThrough();
};

export {sendAndReceiveServiceMock, spyOnSendAndReceiveServiceMock};
