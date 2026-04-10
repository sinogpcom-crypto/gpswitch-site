(function () {

    setTimeout(function(){
        $("body").addClass("show")
    },500);

    //头部搜索
    var seachBox = $('.search_box'),
    seachBtn = $('.seach_btn'),
    searchClose =  $('.search_close');
    seachBtn.click(function (event) {
        seachBox.addClass('show');
    });
    searchClose.click(function (event) {
        seachBox.removeClass('show');
    });


    $(".lang_btn span").click(function(){
        $(this).parent().toggleClass("active");
    })
    

    //显示导航
    function showMenu() {
        var _body = $('body'), _navList = $('#navList'), _itemList = _navList.find('>li'), _smMenu = $('#smMenu'), _fixed = 'fixed', _subItem = '.sub-item', _handle = 'span.top', _show = 'showIt';

        _itemList.each(function () {
            if ('undefined' !== typeof $(this).find(_subItem).get(0)) {
                $(this).find(_handle).on('click', function () {
                    var _parent = $(this).parents('li').eq(0);
                    if (_parent.hasClass(_show)) {
                        _parent.removeClass(_show);
                    } else {
                        $(this).parents('ul').find('li').removeClass(_show);
                        _parent.addClass(_show);
                    }
                });
            } else {
                $(this).find(_handle).addClass('empty');
            }
        });

        //显示导航
        _smMenu.on('click', function () {
            if (_body.hasClass(_fixed)) {
                _body.removeClass(_fixed);
            } else {
                _body.addClass(_fixed);
            }
        });
    }

    //pc顶部导航固定
    function fixedNav() {

        var _body = $('body'), _fixed = 'fixed2', _isInner = false, _top = 0, _limit = $('.header-wrapper2').height()+10;

        function isFixed(_top) {
            if (_top > _limit && !_body.hasClass(_fixed)) {
                _body.addClass(_fixed);



            } else if (_top <= _limit && _body.hasClass(_fixed)) {
                _body.removeClass(_fixed);
            }
        }

        isFixed($(window).scrollTop());
        $(window).scroll(function () {
            if (!_isInner) {
                _isInner = true;
                _top = $(this).scrollTop();
                if (_isInner) isFixed(_top);
                _isInner = false;

            }

        });
    }

    $(function () {
        showMenu();
        fixedNav();
    });


})(jQuery);







bannerResize = function () {


    try {
        $(".i_banner .ibanner_box .iteam .img").css("transition", "all 0s ease");

        // 首页banner(图片比例1920*800)
        var winH = $(window).outerHeight();
        var winW = $(window).outerWidth();
        // $('.i_banner').height(winH);
        // $('.i_banner .img').width(winW);
        // $('.i_banner .img').height(winH);
        // $('.i_banner .video_box').width(winW);
        // $('.i_banner .video_box').height(winH);
        $(".i_banner .ibanner_box .iteam .img").css("transition", "all 10s ease");

        banner.updateSize();

            
        
        
        //alert();
    } catch (error) {

    }


}





$(function(){
    bannerResize();
    
    var banner = new Swiper('.ibanner_box', {
        slidesPerView: 1,
        paginationClickable: true,
        spaceBetween: 0,
        loop: false,
        autoplay: {
            delay: 4000,
            stopOnLastSlide: false,
            disableOnInteraction: true,
        },
        pagination: {
            el: '.ibanner-pagination',
            clickable: true,
        },
        on:{
            init: function(swiper){
                
                $(".ibanner-num").text(this.activeIndex + 1);
                $(".ibanner-fix").addClass("active");

                $(".ibanner_list .item").removeClass("active");
                $(".ibanner_list .item").eq(this.activeIndex + 1).addClass("active");

                this.emit('transitionEnd');
            }, 
            slideChange: function(){
                $(".ibanner_list .item").removeClass("active");
                $(".ibanner_list .item").eq(this.activeIndex + 1).addClass("active");

                $(".ibanner_box").find("video").trigger('pause');

                $(".video_btns").removeClass("active");
                $(".video_btns").html("PLAY");
                $(".video_box").removeClass("play");

                return false;
            },
            slideChangeTransitionStart: function(){
                $(".ibanner-fix").removeClass("active");
            },
            slideChangeTransitionEnd: function(){
                $(".ibanner-fix").addClass("active");
            },

        },
    
        observer: true,
    });

    $(".ibanner_list .item").click(function(){
        var index = $(this).index() - 1;
        banner.slideTo(index,300);
        banner.autoplay.start();
    })

    $(".video_btns").on("click", function () {

        if ($(this).hasClass("active")) {

            $(this).removeClass("active");
            $('video').trigger('pause');
            $(".video_btns").html("PLAY");
            $(".video_box").removeClass("play");
            banner.autoplay.start();

        } else {
            $('video').trigger('pause');
            $(".video_btns").removeClass("active");
            $(this).addClass("active");
            $(this).html("PAUSE");
            banner.autoplay.stop();

            // console.log($(this).data("index"));
            var num = $(this).data("index");
            var myVideo = $('#video' + num);

            myVideo.parent(".video_box").addClass("play");
            // console.log(myVideo.parent(".video_box").addClass("play"));
            myVideo.trigger('play');
        }
    })
})



//头部滚动
$(document).ready(function () {
    $(window).scroll(function () {
        currTop = $(window).scrollTop();
        if (currTop < 20) {
            $('.header-wrapper').removeClass('tophide');

        } else {
            $('.header-wrapper').addClass('tophide');
        }

        if (currTop > 0) {
            $("body").removeClass("fixed");
        }



    });
    if ($(window).scrollTop() > 0) {
        $('.header-wrapper').addClass('tophide');

    }

    $(".business_bottom .item").eq(0).find(".box").addClass("active");
    $(".business_bottom .box").click(function(){
        let index = $(this).parent().index();
        $(".business_bottom .box").removeClass("active");
        $(this).addClass("active");
        $(".business_info .item").hide();
        $(".business_info .item").eq(index).fadeIn();

    })

    
    $(".strengths_list .item").eq(0).find(".item-box").addClass("active");
    $(".strengths_list .item-box").click(function(){
        let index = $(this).parent().index();
        $(".strengths_list .item-box").removeClass("active");
        $(this).addClass("active");
        $(".strengths_info .box").hide();
        $(".strengths_info .box").eq(index).fadeIn();
    })


    if(1025 > $(window).width()){

        $(".business_bottom_box").find(".item").addClass("swiper-slide").removeClass("item");
        var businessBottom = new Swiper('.business_bottom_box', {
            slidesPerView: 2,
            paginationClickable: true,
            spaceBetween: 10,
            loop: false,
            
            on:{
                init: function(swiper){
                    
                }, 
                slideChange: function(){
                    
                },
                
    
            },
        
        });

        $(".strengths_list_box").find(".item").addClass("swiper-slide").removeClass("item");
        var businessBottom = new Swiper('.strengths_list_box', {
            slidesPerView: 2,
            paginationClickable: true,
            spaceBetween: 0,
            loop: false,
            
            on:{
                init: function(swiper){
                    
                }, 
                slideChange: function(){
                    
                },
                
    
            },
        
        });

    }


})

// 侧导航


var swipernotice = new Swiper('.notice-container', {
    direction: 'vertical',
    loop: true,
    autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: true,
    },
    navigation: {
        nextEl: '.notice-next',
        prevEl: '.notice-pre',
    },
});



var swiper1;
var swiper2;
var swiper3;




$(function () {

    try {
        $(window).on('resize', function () {
            repage_com();
            bannerResize();
        });
        repage_com();
    } catch (error) {

    }

    function repage_com() {
        pagew = $(document).outerWidth(true) + (window.innerWidth - document.body.clientWidth);
        pageh = $(window).innerHeight();
        try {
            $(".curdiv_h").each(function () {
                $(this).css({ "height": ($(this).attr("data-h") * $(this).width() / $(this).attr("data-w")) + "px" });
            });
        }
        catch (e) { }
    }

})


$(function(){
    $(".backTop").click(function(){
        $('html,body').animate({ scrollTop: 0 }, 700);

    })
    var newLocal = ".category_head";
    $(newLocal).click(function(){
        $(".page_nav").slideToggle(300);
        $(".category_head").toggleClass("active");
    })

    var videoBor = $(".page-video");//video的swiper对象数组
    var videolist = videoBor.find("video");//video对象数组
    videoBor.on("click",function(){
        var $video = $(this).find("video")[0];
        if($video.paused){
            var videoPoster =$(this).find(".posterBg");//当前封面对象
            videoPoster.hide();
            $video.play();
        }else{
            $video.pause();
        }
    });
    videolist.on("pause",function(){
        /*所有封面浮层show&所有视频hide*/
        videoBor.find(".posterBg").show();
        videoBor.find("video").hide();
    });

    videolist.on("play",function(){
        /*当前视频show*/
        $(this).show();
    });


    $(".description-list .item:first-child").addClass("active");
    $(".description-list .item:first-child").find(".item-box").show();
    $(".description-list .item-header").click(function(){
        $(this).parent().toggleClass("active");
        $(this).parent().find(".item-box").slideToggle();
    })
    

    $(".product-sample-title a").eq(0).addClass("active");
    $(".product-sample-box .box").eq(0).show();
    $(".product-sample-title a").click(function(){
        let index = $(this).index();
        $(".product-sample-title a").removeClass("active");
        $(".product-sample-box .box").hide();
        $(this).addClass("active");
        $(".product-sample-box .box").eq(index).fadeIn();
    })
    

    
    $(".page-position-list .position-item").eq(0).find(".item-header").addClass("active");
    $(".page-position-list .position-item").eq(0).find(".item-info").show();

    $(".page-position-list .item-header").click(function(){
        let index = $(this).index();
        $(".page-position-list .position-item").removeClass("active");
        $(this).parent().addClass("active");
        $(".page-position-list .item-info").slideUp();
        $(this).parent().find(".item-info").slideDown();
        

    })
    
    

})





