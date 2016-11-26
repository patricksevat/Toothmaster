export default function () {
  const skip = this;
  skip.getSkip = getSkip;
  skip.setSkip = setSkip;
  
  skip.value = undefined;
  
  function getSkip() {
    return skip.value;
  }
  function setSkip(boolean) {
    skip.value = boolean;
  }
}
