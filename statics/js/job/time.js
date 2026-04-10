$(function(){
    $("input").focus(function(){
        if(t==1800000)setInterval(dateline,1000);
    })
    $(".tag_select").click(function(){
        if(t==1800000)setInterval(dateline,1000);
    })
    var EndTime= new Date('2016/02/26 10:30:00');
    var NowTime = new Date('2016/02/26 10:00:00');
    var t =EndTime.getTime() - NowTime.getTime();
    function dateline(){
        var m=Math.floor(t/1000/60%60);
        var s=Math.floor(t/1000%60);
        var ml=Math.floor(m/10);
        var mr=Math.floor(m%10);
        var sl=Math.floor(s/10);
        var sr=Math.floor(s%10);
        $(".timer-minute-l").html(ml);
        $(".timer-minute-r").html(mr);
        $(".timer-second-l").html(sl);
        $(".timer-second-r").html(sr);t-=1000;
    }
})