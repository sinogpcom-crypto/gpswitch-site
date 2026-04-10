$(function(){
    $(".zp-list-box").css("display","block")
    $(".zp-date-up").click(function(){
        $(this).next("div").toggle();
        $(this).find(".zp-arrow-down").toggle();
        $(this).find(".zp-arrow-up").toggle();
    });

   
    $("input[name='info[from]']").last("input").parent("label").next("textarea").css("display","none").end().end().end().click(function(){
        if($(this).attr("value")=="网站"||$(this).attr("value")=="其他"||$(this).attr("value")=="内部推荐"){
            $(this).parents(".zp-list").find("textarea").css("display","inline-block");
        }else{
            $(this).parents(".zp-list").find("textarea").css("display","none");
        }
    })
    $("input[name='info[know]']").last("input").parent("label").next("textarea").css("display","none").end().end().end().click(function(){
        if($(this).attr("value")=="认识"){
            $(this).parents(".zp-list").find("textarea").css("display","inline-block");
        }else{
            $(this).parents(".zp-list").find("textarea").css("display","none");
        }
    })
    $("input[name='info[fund]']").last("input").parent("label").next("label").css("display","none").next("input").css("display","none").end().end().end().end().click(function(){
        if($(this).attr("value")=="有"){
            $(this).parents(".zp-list").find("input").last().css("display","inline-block").prev("label").css("display","inline-block");
        }else{
            $(this).parents(".zp-list").find("input").last().css("display","none").prev("label").css("display","none");
        }
    })

    $(".zp-submit").css({"background":"#999"}).attr("disabled",true);
    $(".check-one").change(function(){
        if($(this).is(":checked")){
            $(".zp-submit").css({"background":"#f5093d"}).attr("disabled",false);
        }else{
            $(".zp-submit").css({"background":"#999"}).attr("disabled",true);
        }
    })
    $("input.check-one").get(0).checked=false;
    $("input[name='info[sex]']").get(0).checked=true;
    $("input[name='info[marry]']").get(0).checked=true;
    //$("input[name='sex']").get(0).checked=true;
    $("input[name='info[isget1]']").get(0).checked=true;
    //$("input[name='edu1']").get(0).checked=true;
    //$("input[name='info[isget2]']").get(0).checked=true;
   // $("input[name='info[isget1]']").get(0).checked=true;
    //$("input[name='iscan2']").get(0).checked=true;
    $("input[name='info[from]']").get(0).checked=true;
    $("input[name='info[know]']").get(0).checked=true;
    $("input[name='info[jobstatus]']").get(0).checked=true;
    $("input[name='info[insurance]']").get(0).checked=true;
    $("input[name='info[fund]']").get(0).checked=true;
    $("input[name='info[state]']").get(0).checked=true;
	//$("input[name='info[guarantee]']").get(0).checked=false;

    $(".zp-how-get").css("display","block");
    $(".zp-how-reason").css("display","block");


    $(".zp-how-get").css("display","block");
    $(".zp-how-reason").css("display","block");

    $("#seachprov").change(function(){
        var pr=$("#seachprov option:selected").text();
        var ci=$("#seachcity option:selected").text();
        var di=$("#seachdistrict option:selected").text();
        $(".zp-input-hidden").val(pr+"-"+ci+"-"+di);
    })
    $("#seachcity").change(function(){
        var pr=$("#seachprov option:selected").text();
        var ci=$("#seachcity option:selected").text();
        var di=$("#seachdistrict option:selected").text();
        $(".zp-input-hidden").val(pr+"-"+ci+"-"+di);
    })
    $("#seachdistrict").change(function(){
        var pr=$("#seachprov option:selected").text();
        var ci=$("#seachcity option:selected").text();
        var di=$("#seachdistrict option:selected").text();
        $(".zp-input-hidden").val(pr+"-"+ci+"-"+di);
    })



    $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"})
    $(".wheel-list").click(function(e){
        $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"})
        $(this).each(function(){
            $(this).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        })
    });

    $(window).scroll( function() {
        var height_top=$(".zp-con-top").eq(0).offset().top;
        var height_a=$(".zp-date").eq(0).offset().top;
        var height_b=$(".zp-date").eq(1).offset().top;
        var height_c=$(".zp-date").eq(2).offset().top;
        var height_d=$(".zp-date").eq(3).offset().top;
        var height_e=$(".zp-date").eq(4).offset().top;
        var height_f=$(".zp-date").eq(5).offset().top;
        var height_g=$(".zp-date").eq(6).offset().top;
        var height_v=$(".zp-video").eq(0).offset().top-200;
        if ($(window).scrollTop() >= height_top ) {
            $(".wheel-box").css({"display":"block"})
        }else{
            $(".wheel-box").css({"display":"none"})
        }
        if ($(window).scrollTop() >= height_a ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(0).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_b ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(1).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_c ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(2).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_d ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(3).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_e ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(4).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_f ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(5).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_g ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(6).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
        if ($(window).scrollTop() >= height_v ) {
            $(".wheel-list").css({"background":"url(/bangcms_hr/statics/images/job/gun_22.png)"}).eq(7).css("background","url(/bangcms_hr/statics/images/job/gun_2.png)")
        }
    })


})