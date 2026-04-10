<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>UEditor 1.4.3.3-vue示例</title>
	<script type="text/javascript" src="ueditor.config.js" charset="utf-8"></script>
	<script type="text/javascript" src="ueditor.all.min.js" charset="utf-8"></script>
	<link type="text/css" rel="Stylesheet" href="WordPaster/css/WordPaster.css"/>
    <link type="text/css" rel="Stylesheet" href="WordPaster/js/skygqbox.css" />
    <script type="text/javascript" src="WordPaster/js/json2.min.js" charset="utf-8"></script>
    <script type="text/javascript" src="WordPaster/js/jquery-1.4.min.js" charset="utf-8"></script>
	<script type="text/javascript" src="WordPaster/js/skygqbox.js" charset="utf-8"></script>
	<script type="text/javascript" src="WordPaster/js/w.edge.js" charset="utf-8"></script>
    <script type="text/javascript" src="WordPaster/js/w.app.js" charset="utf-8"></script>
    <script type="text/javascript" src="WordPaster/js/w.file.js" charset="utf-8"></script>
    <script type="text/javascript" src="WordPaster/js/w.js" charset="utf-8"></script>
	<script type="text/javascript" src="vue.min.js" charset="utf-8"></script>
</head>
<body>
	<div id="ue">
		<ueditor ref="ue"></ueditor>
	</div>
	<script>
        Vue.component('ueditor', {
            data: function(){
                return {
                    editor: null
                }
            },
            props: {
                value: '',
                config: {}
            },
            mounted: function(){
                WordPaster.getInstance({
					PostUrl: "http://localhost:81/WordPaster2/WordPasterUEditor1.4x/php/upload.php"
                }).Load();//加载控件
				
                this.editor = window.UE.getEditor('editor');
                
                //WordPaster快捷键 Ctrl + V
                this.editor.addshortcutkey({
                    "wordpaster": "ctrl+86"
                });
            },
            methods: {
                getUEContent: function(){
                    return this.editor.getContent()
                }
            },
            destroyed: function(){
                this.editor.destroy()
            },
            template: '<div><textarea id="editor" name="editor"/></div>'
        });

        var ue = new Vue({
            el: '#ue',
            data: {},
            mounted: function () {}
        });

    </script>
</body>
</html>
