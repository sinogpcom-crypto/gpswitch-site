function WebServer(mgr)
{
    var _this = this;
    // 创建一个Socket实例
    this.socket = null;
    this.tryConnect = true;
    this.exit = false;
    this.runed = false;

    this.run = function ()
    {
        if (this.runed) return;
        if (typeof navigator.msLaunchUri != 'undefined')
        {
            console.log(mgr.Config.edge.protocol + "://" + mgr.Config.edge.port);
            //up6://9006
            navigator.msLaunchUri(mgr.Config.edge.protocol + "://" + mgr.Config.edge.port, function ()
            {
                console.log('应用打开成功');
            }, function ()
            {
                console.log('启动失败');
            });
            _this.runed = true;
        }
    };
    this.runChr = function () {
        var protocol = mgr.Config.edge.protocol + "://?port=" + mgr.Config.edge.port;
        var html = "<iframe id='wordpaster-uri-fra' width=1 height=1 src='" + protocol + "'></iframe>";
        $("#wordpaster-uri-fra").remove();
        $(document.body).append(html);
    };
    this.connect = function ()
    {
        if (!_this.tryConnect) return;
        var con = new WebSocket('ws://127.0.0.1:' + mgr.Config.edge.port);
        console.log("开始连接服务:" + 'ws://127.0.0.1:' + mgr.Config.edge.port);

        // 打开Socket 
        con.onopen = function (event)
        {
            _this.socket = con;
            _this.tryConnect = false;
            console.log("服务连接成功");

            // 监听消息
            con.onmessage = function (event)
            {
                mgr.recvMessage(event.data);
            };

            // 监听Socket的关闭
            con.onclose = function (event)
            {
                //手动退出
                if (!this.exit) {
                    _this.tryConnect = true;
                    _this.run();
                }
            };
        };
        con.onerror = function (event)
        {
            _this.run();
            console.log("连接失败");
        };
    };
    this.close = function ()
    {
        this.exit = true;
        if (this.socket) { this.socket.close(3000, "close"); }
    };
    this.send = function (p)
    {
        if (this.socket) this.socket.send(p);
    };
}