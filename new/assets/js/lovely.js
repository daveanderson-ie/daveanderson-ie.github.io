var $ = jQuery.noConflict();

$(document).ready(function($) {
    "use strict";
//  BX Slider
    $('.big-slider').bxSlider({
        auto: false,
        controls: false,
        slideWidth: 750,
        moveSlides: 1,
        minSlides: 1,
        maxSlides: 6,
        slideMargin: 30,
        infiniteLoop: false,
        hideControlOnEnd: false,
        pager: true,
        adaptiveHeight: true
    });
    $('.testimonials-slider').bxSlider({
        auto: false,
        controls: false,
        slideWidth: 1140,
        moveSlides: 1,
        pager: true,
        adaptiveHeight: true
    });
    $('.project-gallery-slider').bxSlider({
        auto: true,
        slideWidth: 1140,
        moveSlides: 1,
        pager: true,
        adaptiveHeight: true
    });

//  Bootstrap Pills
    $('#work-pills a').click(function (e) {
        e.preventDefault();
        $(this).tab('show')
    });

//  Contact Form with validation
    $('#submit').click(function(){
        $("#contactform").validate({
            submitHandler: function() {
                $.post("contact.php", $("#contactform").serialize(),  function(response) {
                    $('#form-status').html(response);
                });
                return false;
            }
        });
    });

//  Smooth Navigation Scrolling
    $('.navigation .nav a[href^="#"], a[href^="#"].roll').on('click',function (e) {
        e.preventDefault();

        var target = this.hash,
            $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top
        }, 2000, 'swing', function () {
            window.location.hash = target;
        });
    });

//  Transparent Header after scroll
    $(function() {
        var header = $(".navigation");
        $(window).scroll(function() {
            var scroll = $(window).scrollTop();
            if (scroll >= 100) {
                header.removeClass('header-solid').addClass("header-opacity");
            } else {
                header.removeClass("header-opacity").addClass('header-solid');
            }
        });
    });

//  Appear.js
    $('.has-animation').appear();
    if (document.documentElement.clientWidth > 768) {

        //  Count Up
        if ($('#numbers').length > 0 ) { // condition if the "numbers" block exists
            var options = { useEasing : true, useGrouping : true, separator : ',', decimal : '.' };
            var days = new countUp("days", 0, 1689, 0, 5, options);
            var lines = new countUp("lines", 0, 360000, 0, 5, options);
            var songs = new countUp("songs", 0, 2500, 0, 5, options);
            var smiles = new countUp("smiles", 0, 650000, 0, 5, options);
        }

        $(document.body).on('appear', '.slide', function() {
            $(this).each(function(){
                $(this).addClass('animation-slide');
            });
        });
        $(document.body).on('appear', '.fade-in', function() {
            $(this).each(function(){
                $(this).addClass('animation-fade-in');
            });
        });
        $(document.body).on('appear', '.progress-bar-scale', function() {
            $(this).each(function(){
                $(this).addClass('animation-progress-bar-scale');
            });
        });
        $(document.body).on('appear', '.scale', function() {
            $(this).each(function(){
                $(this).addClass('animation-scale');
            });
            if ($('#numbers').length > 0 ) { // condition if the "numbers" block exists
                lines.start();
                days.start();
                songs.start();
                smiles.start();
            }
        });
    }

//  Placeholder
    $('input, textarea').placeholder();

//  Revolution slider
    $('.fullwidthbanner').revolution({
        delay:9000,
        startheight:520,
        startwidth:1170,

        hideThumbs: false,

        thumbWidth:100,
        thumbHeight:50,
        thumbAmount:5,

        navigationType:"thu",
        navigationArrows:"solo",
        navigationStyle:"round",

        navigationHAlign:"center",
        navigationVAlign:"bottom",
        navigationHOffset:0,
        navigationVOffset:20,

        soloArrowLeftHalign:"center",
        soloArrowLeftValign:"bottom	",
        soloArrowLeftHOffset:20,
        soloArrowLeftVOffset:0,

        soloArrowRightHalign:"center",
        soloArrowRightValign:"bottom",
        soloArrowRightHOffset:20,
        soloArrowRightVOffset:0,
        touchenabled:"on",
        onHoverStop:"on",

        navOffsetHorizontal:0,
        navOffsetVertical:20,

        hideCaptionAtLimit:0,
        hideAllCaptionAtLilmit:0,
        hideSliderAtLimit:0,

        stopAtSlide:-1,
        stopAfterLoops:-1,

        shadow:0,
        fullWidth:"off"
    });

//  Vanilla Box
    $('#video').vanillabox({
        animation: 'default',
        preferredWidth: 1100,
        type: 'iframe'
    });
});
