/**
 * Created by Patrick on 11/02/2016.
 */
var page = 0;

function showSafetySlide() {
  switch (page) {
    case 0:
          $('#safety-slide-card').append('<p>slide 0</p>');
          page++;
          break;
    case 1:
          $('#safety-slide-card').append('<p>slide 1</p>');
          page++;
          break;
  }

}


  $("#start-safety-slide").click(function(){
    alert('hello');
    showSafetySlide();
  })



