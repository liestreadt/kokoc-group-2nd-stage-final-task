;(function() {
  $('.service-slider .main-slider').slick({
    infinite: true,
    arrows: false,
    dots: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    adaptiveHeight: true,
});

$('.slider-reviews .main-slider').slick({
  infinite: true,
  arrows: true,
  dots: false,
  slidesToShow: 3,
  slidesToScroll: 1,
  prevArrow: '<img src="images/arrow-prev.png" class="slick-prev">',
  nextArrow: '<img src="images/arrow-next.png" class="slick-next">',
});
})();