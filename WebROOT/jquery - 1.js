//自调函数把window这个全局变量传入
(function(){
	//把jQuery和$另存一份
	var _jQuery = window.jQuery,_$ = window.$;
	//定义jQuery对象
	var jQuery = window.jQuery = window.$ = function(){
		//返回的其实是function init()的实例
		return  new jQuery.fn.init();
	}
	jQuery.fn = jQuery.prototype = {
		//这个方法用来构造jQuery对象
		init:function(){
			return this;
		},
		//定义一些其他的属性
		length: 0,
		jquery:"1.0.0",
		author:"BaiQiang",
		size:function(){
			return this.length;
		}
	};
	//使用jQuery的原型覆盖init的原型 这样就自动把jQuery.prototype的方法可以在init里面使用
	jQuery.fn.init.prototype=jQuery.fn;
})(window);
