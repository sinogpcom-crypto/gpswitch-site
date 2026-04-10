/**
 * Created by yanhuadong on 2016/2/20.
 */

(function($){
    function hideOptions(speed){/*下拉列表显示*/
        if(speed.data){speed=speed.data}
        if($(document).data("nowselectoptions"))
        {
            $($(document).data("nowselectoptions")).slideUp(speed);
            $($(document).data("nowselectoptions")).prev("div").removeClass("tag_select_open");
            $(document).data("nowselectoptions",null);
            $(document).unbind("click",hideOptions);
            $(document).unbind("keyup",hideOptionsOnEscKey);
        }
    }
    function hideOptionsOnEscKey(e){/*下拉列表显示*/
        var myEvent = e || window.event;
        var keyCode = myEvent.keyCode;
        if(keyCode==27)hideOptions(e.data);
    }
    function showOptions(speed){
        $(document).bind("click",speed,hideOptions);/*下拉列表显示*/
        $(document).bind("keyup",speed,hideOptionsOnEscKey);
        $($(document).data("nowselectoptions")).slideDown(speed);/*下拉列表显示*/
        $($(document).data("nowselectoptions")).prev("div").addClass("tag_select_open");
    }

    $.fn.selectCss=function(_speed){
        $(".zp-select-site").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-level-add-time' style='width:186px;position:absolute;top:0;left:105px;'></div>").insertAfter(this).addClass("tag_select");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:105px;width:218px'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);/*下拉列表显示*/
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;/*弹出，上字*/
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(/*掠过变色*/
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });
        $(".zp-select-time-l").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-level-add-time' style='width:160px;position:absolute;top:0;left:105px;padding-left:42px;'></div>").insertAfter(this).addClass("tag_select");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:105px;width:218px'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });
        $(".zp-select-time-r").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-level-add-time' style='width:160px;position:absolute;top:0;left:365px;;padding-left:42px;'></div>").insertAfter(this).addClass("tag_select");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:365px;width: 218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });
        $(".zp-select-position").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-level-add-time' style='width:186px;position:absolute;top:0;left:105px;'></div>").insertAfter(this).addClass("tag_select");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:105px;width: 218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });

        $(".zp-select-level").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-level-add-time' style='width:186px;position:absolute;top:0;left:573px;'></div>").insertAfter(this).addClass("tag_select");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:573px;width: 218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });




        $(".zp-select-edu-up").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-edu' style='width:86px;position:absolute;top:0;left:105px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:105px;width:118px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });

        $(".zp-select-edu-down").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-edu' style='width:86px;position:absolute;top:0;left:105px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:105px;width:118px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });



        $(".zp-select-factor-l").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-factor' style='width:186px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:0;top: 100px;width:218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });


        $(".zp-select-factor-m").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-factor' style='width:186px;position:absolute;top:50px;left:230px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:230px;top: 100px;width:218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });


        $(".zp-select-factor-r").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-factor' style='width:186px;position:absolute;top:50px;left:460px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:460px;top: 100px;width:218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });

        $(".zp-select-structure").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-factor' style='width:186px;position:absolute;top:0;left:105px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:105px;top: 50px;width:218px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });

        $(".zp-select-addrtime").each(function(){
            var speed=_speed||"fast";
            if($(this).data("cssobj")){
                $($(this).data("cssobj")).remove();
            }
            $(this).hide();
            /*2-20*/
            var divselect = $("<div class='zp-select-div-time zp-select-addrtime-ba' style='width:86px;position:absolute;top:60px;left:580px;'></div>").insertAfter(this).addClass("tag_select zp-select-edu");
            $(this).data("cssobj",divselect);
            var divoptions = $("<ul style='left:580px;top: 110px;width:118px;'></ul>").insertAfter(divselect).addClass("tag_options").hide();
            divselect.click(function(e){
                if($($(document).data("nowselectoptions")).get(0) != $(this).next("ul").get(0)){
                    hideOptions(speed);
                }
                if(!$(this).next("ul").is(":visible"))
                {
                    e.stopPropagation();
                    $(document).data("nowselectoptions",$(this).next("ul"));
                    showOptions(speed);
                }
            });
            divselect.hover(function(){
                    $(this).addClass("tag_select_hover zp-select-edu-no");
                }
                ,
                function(){
                    $(this).removeClass("tag_select_hover zp-select-edu-no");
                });
            $(this).change(function(){
                $(this).nextAll("ul").children("li:eq("+ $(this)[0].selectedIndex +")").addClass("open_selected").siblings().removeClass("open_selected");
                $(this).next("div").html($(this).children("option:eq("+ $(this)[0].selectedIndex +")").text());
            });
            $(this).children("option").each(function(i){
                var lioption= $("<li></li>").html($(this).text()).attr("title",$(this).attr("title")).appendTo(divoptions);
                if($(this).attr("selected")){
                    lioption.addClass("open_selected");
                    divselect.html($(this).text());
                }
                lioption.data("option",this);
                lioption.click(function(){
                    lioption.data("option").selected=true;
                    $(lioption.data("option")).trigger("change",true)
                });
                lioption.hover(
                    function(){$(this).addClass("open_hover");},
                    function(){ $(this).removeClass("open_hover"); }
                );
            });
        });


    }
})(jQuery);