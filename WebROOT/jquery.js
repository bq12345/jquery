//自调函数把window这个全局变量传入
(function () {
    // 把jQuery和$另存一份 以便发生冲突的时候再使用
    var _jQuery = window.jQuery,
        _$ = window.$;
    // 在上次的代码上添加选择器机制
    var jQuery = window.jQuery = window.$ = function (selector, context) {
        return new jQuery.fn.init(selector, context);
    };
    // 对 HTML strings or ID strings进行判定
    /*
     * 可以把它看作是两个正则表达式串： 第一个：^[^<]*(<(.|\s)+>)[^>]*$ 第二个：^#(\w+)$ /^ 字符串开始 [^<]*
     * 匹配不包含<号的任意长度字符，长度可以为0 (<(.|\s)+ 匹配任意字符或空白符，长度必须大于等于1 >)[^>]*
     * 匹配不包含>号的任意字符，长度可以为0 $ 字符串结束 | 或 ^ 字符串开始 # 匹配符号# (\w+)
     * 匹配a-zA-z0-9，也就是所有英文字母及数字，长度大于等于1 $/; 结束
     */
    var quickExpr = /^[^<]*(<(.|\s)+>)[^>]*$|^#(\w+)$|^.(\w+)$|/;
    jQuery.fn = jQuery.prototype = {

        init: function (selector, context) {
            selector = selector || document;
            context = context || document;
            // 如果传入的是DOM 节点对象
            if (selector.nodeType) {
                this[0] = selector;
                this.length = 1;
                return this;
            }
            // 对于选择器是字符串有可能是#id
            if (typeof selector == "string") {

                // Are we dealing with HTML string or an ID?
                var match = quickExpr.exec(selector);
                /*console.log("match result is "+match);*/
                // Verify a match, and that no context was specified for #id
                if (match && (match[0] || !context)) {

                    if (match[1]) {
                        selector = jQuery.clean([match[1]], context);
                        return this.setArray(jQuery.makeArray(selector));
                    } else if (match[3]) {
                        var elem = document.getElementById(match[3]);
                        this.length = 1;
                        return jQuery(elem);
                        selector = [];
                    } else if (match[4]) {
                        //我选择使用CSS3选择器
                        var elements = document.getElementsByClassName(match[4]);
                        //转化为数组加入到jQuery类数组对象
                        return this.setArray(jQuery.makeArray(elements));
                    } else {
                        //CSS3选择器 估计这里也不会执行
                        var elements = document.querySelectorAll(match[0]);
                        return this.setArray(jQuery.makeArray(elements));
                    }
                }
            }
            //解决不了的全部交给CSS3选择器 出故障暂时不管

            var others = document.querySelectorAll(selector);
            // console.log("this is:"+Object.prototype.toString.call(this));
            return this.setArray(jQuery.makeArray(others));
        },
        // 新增加一个方法用来取得或设置jQuery对象的html内容
        html: function (val) {
            // 遍历通过回调函数来设置innerHTML为val参数
            return jQuery.each(this,
                function (val) {
                    this.innerHTML = val;
                },
                val);
        },
        length: 0,
        jquery: "1.0.0",
        author: "BaiQiang",
        size: function () {
            return this.length;
        },
        //直接调用jQuery静态函数
        each: function (callback, args) {
            return jQuery.each(this, callback, args);
        },
        //扩展一些有用的方法
        setArray: function (elems) {
            this.length = 0;
            Array.prototype.push.apply(this, elems);
            return this;
        },

        attr: function (name, value, type) {
            //为所有匹配的元素设置一个计算的属性值。
            //不提供值，而是提供一个函数，由这个函数计算的值作为属性值。
            var options = name;
            // Look for the case where we're accessing a style value
            if (name.constructor == String)
            // 如果没有传入要设置的值,则要获得该属性的值.
                if (value === undefined)
                //运算符&&的行为是这样的:对于它两边表达式,谁要把运算给中止了,就返回谁.
                    return this[0] && jQuery[type || "attr"](this[0], name);
                else {
                    //处理键值对
                    options = {};
                    options[name] = value;
                }
                //遍历所有options 字符串就是一次 键值对循环
            return this.each(function (i) {
                // Set all the styles
                for (name in options) jQuery.attr(type ?
                    //如果有传入type,就表示要设置样式属性;如果没有则表示要设置一般的属性
                    this.style : this, name, jQuery.prop(this, options[name], type, i, name));
            });
        },
        css: function (key, value) {
            if ((key == 'width' || key == 'height') && parseFloat(value) < 0) value = undefined;
            //其实就是调用attr 并设置第三个参数type为"curCSS"
            return this.attr(key, value, "curCSS");
        },

    };
    // 简单的遍历函数
    /*
     * jQuery.each = function(obj, callback, args) { for (var i = 0; i <
     * obj.length; i++) { callback.call(obj[i], args); } return obj; };
     */
    // 需要深入理解一下jQuery的复制函数写法
    jQuery.extend = jQuery.fn.extend = function () {
        // 用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
        //jQuery.extend(settings, options);
        //var settings = jQuery.extend({}, defaults, options);
        //target是被扩展的对象,默认是第一个参数(下标为0)或者是一个空对象{}
        var target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false,
            options;
        /*
         * 如果传进来的首个参数是一个boolean类型的变量，那就证明要进行深度拷贝。
         * 而这时传进来的argumens[1]就是要拷贝的对象.如果是这种情况,那就要做一些"矫正"工作,
         * 因为这个时候,target变量指向的是一个布尔变量而不是我们要拷贝的对象.
         */
        if (target.constructor == Boolean) {
            deep = target;
            target = arguments[1] || {};
            // 这样的话使得i=2直接跳过前两个参数
            i = 2;
        }

        // 如果target不是objet 并且也不是function 就默认设置它为{};
        if (typeof target != "object" && typeof target != "function") target = {};

        // 一个参数的就是扩展jQuery对象本身
        if (length == i) {
            target = this;
            --i;
        }

        for (; i < length; i++)
        // 非null的扩展对象才把它扩展到被扩展对象上来.
            if ((options = arguments[i]) != null)
            // Extend the base object
                for (var name in options) {
                    // target是被扩展对象 options是扩展对象, 它的方法或属性将会被扩展到target上
                    var src = target[name],
                        copy = options[name];

                    // target和copy如果相等还深拷贝的话就出问题了
                    if (target === copy) continue;

                    // Recurse if we're merging object values
                    // 递归src和copy深度拷贝即对每一个属性递归
                    // 要是没有nodeType, 就是非Dom对象引用, 可以对它进行深度拷贝
                    if (deep && copy && typeof copy == "object" && !copy.nodeType) target[name] = jQuery.extend(deep,
                        // Never move original objects, clone them
                        src || (copy.length != null ? [] : {}), copy);

                    // Don't bring in undefined values
                    // 如果要加进来的引用不是对象的引用(只要不是undefined ) 那就把引用加进来
                    // 可能是覆盖也可能是新建name这个属性或方法
                    else if (copy !== undefined) target[name] = copy;

                }

            // 返回扩展后的被扩展对象
        return target;
    };
    //定义一个会在CSS设置中用到的正则表达式
    var exclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
    // 上次我写了jQuery的extend函数 用来拷贝对象 这次我们就来使用一下来完成一些有意义的事情
    jQuery.extend({
        getName: function () {
            return "This is BaiQiang's jQuery";
        },
        noConflict: function (deep) {
            // 扩展jQuery对象本身。
            // 使用这个函数必须以jQuery 开头，不能用$开头
            // 把保存的_$还回给$
            window.$ = _$;
            if (deep) window.jQuery = _jQuery;
            return jQuery;
        },
        // 判断传入的参数是否一个函数
        isFunction: function (fn) {
            return typeof fn == "function";
            // 简写一下,不用jQuery的方法
            // return !!fn && typeof fn != "string" && !fn.nodeName &&
            // fn.constructor != Array && /^[\s[]?function/.test( fn +
            // "" );
        },
        // 判断参数是否为一个XML节点
        isXMLDoc: function (elem) {
            // body是HTMLDocument特有的节点常用这个节点来判断当前的document是不是一个XML的文档引用
            return elem.documentElement && !elem.body || elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
        },
        trim: function (data) {
            // 第一部分^\s第二部分\s+$ 替换为空
            return (data || "").replace(/^\s+|\s+$/g, "");
        },
        // 在全局的作用域中运行脚本
        globalEval: function (data) {
            // 调用trim去除两边空格---见上
            data = jQuery.trim(data);
            if (data) {
                // 动态创建节点
                var head = document.getElementsByTagName("head")[0] || document.documentElement,
                    script = document.createElement("script");
                script.type = "text/javascript";
                if (jQuery.browser.msie) script.text = data;
                else script.appendChild(document.createTextNode(data));
                // 兼容问题 Use insertBefore instead of appendChild to circumvent an IE6 bug.
                // 方法：可向节点的子节点列表的末尾添加新的子节点。语法：appendChild(newchild)
                // insertBefore() 方法：可在已有的子节点前插入一个新的子节点。语法
                // ：insertBefore(newchild,refchild)
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
        },
        // 继续扩建 这次增加一个each方法 相比以前那个简单的each方法高级了许多
        each: function (object, callback, args) {
            // 以每一个匹配的元素作为上下文来执行一个函数。
            // 意味着，每次执行传递进来的函数时，
            // 函数中的this关键字都指向一个不同的DOM元素（每次都是一个不同的匹配元素）。
            // 而且，在每次执行函数时，都会给函数传递一个表示作为执行环境的元素在匹配的元素集合中所处位置的数字值作为参数（从零开始的整形）。
            // 返回 'false' 将停止循环 (就像在普通的循环中使用 'break')。
            // 返回 'true' 跳至下一个循环(就像在普通的循环中使用'continue')。
            var name, i = 0,
                length = object.length;
            if (args) {
                // 对象如果没有length就直接遍历否则用i下标遍历
                if (length == undefined) {
                    for (name in object)
                    // 回调函数把当前对象指定为object[name]
                        if (callback.apply(object[name], args) === false) break;
                } else
                    for (; i < length;)
                        if (callback.apply(object[i++], args) === false) break;

                        // A special, fast, case for the most common use of each
                        // 没有参数的调用call和apply不同的就是参数传入的是下标或属性以及代表的值
            } else {
                if (length == undefined) {
                    for (name in object)
                        if (callback.call(object[name], name, object[name]) === false) break;
                } else
                    for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) {}
            }
            return object;
        },
        //属性操作 CSS操作也用到
        attr: function (elem, name, value) {
            // 不设置文本或是注释节点
            if (!elem || elem.nodeType == 3 || elem.nodeType == 8) return undefined;
            var notxml = !jQuery.isXMLDoc(elem),
                //是setting呢还是getting
                set = value !== undefined;
            //一些属性名字在Js中的表述并不是原来的属性名字.如class,在JavaScript中就是className.
            name = notxml && jQuery.props[name] || name;
            if (elem.tagName) {
                //特殊元素
                var special = /href|src|style/.test(name);

                /*//webkit bug? 我其实不知道 说不定已经修复了 先不管它了
			if ( name == "selected" && jQuery.browser.webkit)
				elem.parentNode.selectedIndex;*/
                //如果elem的属性中有name所指示的属性 && elem不是XML类型节点 && 不是要特殊对待的href/src/style
                if (name in elem && notxml && !special) {
                    //set的时候有些值不可以改变
                    if (set) {
                        // We can't allow the type property to be changed (In IE problem)
                        if (name == "type" && jQuery.nodeName(elem, "input") && elem.parentNode) throw "属性不可更改";
                        //设置属性
                        elem[name] = value;
                    }

                    //如果是表单属性 使用getAttributeNode
                    if (jQuery.nodeName(elem, "form") && elem.getAttributeNode(name)) return elem.getAttributeNode(name).nodeValue;
                    // 表示元素不是一个form元素, 直接就把元素的值返回
                    return elem[name];
                }

                if (set)
                // convert the value to a string (all browsers do this but IE) see #1070
                //如果属性是一个非string的值, 除IE外所有的浏览器都能很好地工作.将value变成一个string
                    elem.setAttribute(name, "" + value);

                var attr = notxml && special
                //getAttribute在只有一个参数. 而IE可以用两个参数.
                // Some attributes require a special call on IE
                ? elem.getAttribute(name, 2) : elem.getAttribute(name);

                //返回undefined就说明属性设置失败
                return attr === null ? undefined : attr;
            }
            //并非设值而是把匹配到的字符转成大写,实际上是想做这样的效果:"margin-Top" -> "marginTop"
            name = name.replace(/-([a-z])/ig,
                function (all, letter) {
                    return letter.toUpperCase();
                });
            //set设置值
            if (set) elem[name] = value;
            return elem[name];
        },
        // 再写一些对array操作的扩展
        makeArray: function (array) {
            // 将类数组对象转换为数组对象。
            // 类数组对象有 length 属性，其成员索引为 0 至 length - 1。实际中此函数在 jQuery
            // 中将自动使用而无需特意转换。
            var ret = [];
            if (array != null) {
                var i = array.length;
                // the window, strings and functions also have 'length'
                // 排除null window string function..
                if (i == null || array.split || array.setInterval || array.call) ret[0] = array;
                else
                    while (i) ret[--i] = array[i];
            }
            return ret;
        },
        inArray: function (elem, array) {
            // 确定第一个参数在数组中的位置(如果没有找到则返回 -1 )
            for (var i = 0,
                    length = array.length; i < length; i++)
            // Use === because on IE, window == document
                if (array[i] === elem) return i;
            return -1;
        },
        // 把两个数组拼接起来(将第二个数组接到第一个数组的尾部)
        merge: function (first, second) {
            // We have to loop this way because IE & Opera overwrite the
            // length expando of getElementsByTagName
            var i = 0,
                elem, pos = first.length;
            // Also, we need to make sure that the correct elements are
            // being returned
            // 在一个使用'*'的选择器中,IE会返回注释节点.
            if (jQuery.browser.msie) {
                while (elem = second[i++])
                    if (elem.nodeType != 8) first[pos++] = elem;
            } else
                while (elem = second[i++]) first[pos++] = elem;
            return first;
        },
        // 数组去重 面试还考过
        unique: function (array) {
            var ret = [],
                done = {};
            try {
                for (var i = 0,
                        length = array.length; i < length; i++) {
                    // if(!done[array[i])
                    var id = jQuery.data(array[i]);
                    if (!done[id]) {
                        done[id] = true;
                        ret.push(array[i]);
                    }
                }
            } catch (e) {
                // 遇到问题就返回原来的数组
                ret = array;
            }
            return ret;
        },
        // 过滤数组元素 参见ES5的 fliter
        grep: function (elems, callback, inv) {
            // (可选) 如果 "invert" 为 false 或为设置，则函数返回数组中由过滤函数返回 true 的元素，
            // / 当"invert" 为 true，则返回过滤函数中返回 false 的元素集。
            var ret = [];
            // Go through the array, only saving the items
            // that pass the validator function
            for (var i = 0,
                    length = elems.length; i < length; i++)
                if (!inv != !callback(elems[i], i)) ret.push(elems[i]);
            return ret;
        },
        // 参见ES5中的map不解释
        map: function (elems, callback) {
            /*
             * 将一个数组中的元素转换到另一个数组中。 作为参数的转换函数会为每个数组元素调用，
             * 而且会给这个转换函数传递一个表示被转换的元素作为参数。 转换函数可以返回转换后的值、null（删除数组中的项目）
             * 或一个包含值的数组，并扩展至原始数组中。
             * 为每个数组元素调用，而且会给这个转换函数传递一个表示被转换的元素作为参数。函数可返回任何值。
             * 另外，此函数可设置为一个字符串，当设置为字符串时，将视为“lambda-form”（缩写形式？） 其中 a
             * 代表数组元素。如“a * a”代表“function(a){ return a * a; }”
             */
            var ret = [];
            // Go through the array, translating each of the items to
            // their new value (or values).
            for (var i = 0,
                    length = elems.length; i < length; i++) {
                var value = callback(elems[i], i);
                if (value != null) ret[ret.length] = value;
            }
            return ret.concat.apply([], ret);
        },
        nodeName: function (elem, name) {
            //检查指定的元素里是否有指定的DOM节点的名称。
            ///	<param name="elem" type="Element">要检查的元素</param>
            ///	<param name="name" type="String">要确认的节点名称</param>
            ///	<returns type="Boolean">如果指定的节点名称匹配对应的节点的DOM节点名称返回true; 否则返回 false</returns>
            return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
        },
        //学习jQuery如何处理字符串为DOM元素  其实还没有全明白
        clean: function (elems, context) {
            var ret = [];
            context = context || document;
            // !context.createElement fails in IE with an error but returns typeof 'object'
            if (typeof context.createElement == 'undefined') context = context.ownerDocument || context[0] && context[0].ownerDocument || document;

            jQuery.each(elems,
                function (i, elem) {
                    //直接返回
                    if (!elem) return;
                    //数字直接转字符串
                    if (elem.constructor == Number) elem += '';
                    // 字符串的话就转为DOM元素 
                    if (typeof elem == "string") {
                        // Fix "XHTML"-style tags in all browsers
                        elem = elem.replace(/(<(\w+)[^>]*?)\/>/g,
                            function (all, front, tag) {
                                return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? all : front + "></" + tag + ">";
                            });

                        // Trim whitespace, otherwise indexOf won't work as expected
                        var tags = jQuery.trim(elem).toLowerCase(),
                            div = context.createElement("div");

                        var wrap =
                        // option or optgroup
                        !tags.indexOf("<opt") && [1, "<select multiple='multiple'>", "</select>"] ||

                        !tags.indexOf("<leg") && [1, "<fieldset>", "</fieldset>"] ||

                        tags.match(/^<(thead|tbody|tfoot|colg|cap)/) && [1, "<table>", "</table>"] ||

                        !tags.indexOf("<tr") && [2, "<table><tbody>", "</tbody></table>"] ||

                        // <thead> matched above
                        (!tags.indexOf("<td") || !tags.indexOf("<th")) && [3, "<table><tbody><tr>", "</tr></tbody></table>"] ||

                        !tags.indexOf("<col") && [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"] ||

                        // IE can't serialize <link> and <script> tags normally
                        jQuery.browser.msie && [1, "div<div>", "</div>"] ||

                    [0, "", ""];

                        // Go to html and back, then peel off extra wrappers
                        div.innerHTML = wrap[1] + elem + wrap[2];

                        // Move to the right depth
                        while (wrap[0]--) div = div.lastChild;

                        // Remove IE's autoinserted <tbody> from table fragments
                        if (jQuery.browser.msie) {

                            // String was a <table>, *may* have spurious <tbody>
                            var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ? div.firstChild && div.firstChild.childNodes :

                            // String was a bare <thead> or <tfoot>
                            wrap[1] == "<table>" && tags.indexOf("<tbody") < 0 ? div.childNodes : [];
                            for (var j = tbody.length - 1; j >= 0; --j)
                                if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) tbody[j].parentNode.removeChild(tbody[j]);
                                // IE completely kills leading whitespace when innerHTML is used
                            if (/^\s/.test(elem)) div.insertBefore(context.createTextNode(elem.match(/^\s*/)[0]), div.firstChild);
                        }
                        elem = jQuery.makeArray(div.childNodes);
                    }
                    if (elem.length === 0 && (!jQuery.nodeName(elem, "form") && !jQuery.nodeName(elem, "select"))) return;
                    if (elem[0] == undefined || jQuery.nodeName(elem, "form") || elem.options) ret.push(elem);
                    else ret = jQuery.merge(ret, elem);
                });
            return ret;
        },
        //prop扩展方法
        prop: function (elem, value, type, i, name) {

            if (jQuery.isFunction(value)) value = value.call(elem, i);
            // 对于CSS属性自动+'px'
            return value && value.constructor == Number && type == "curCSS" && !exclude.test(name) ? value + "px" : value;
        },

    });
    // 判断浏览器
    var userAgent = navigator.userAgent.toLowerCase();
    jQuery.browser = {
        version: (userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        webkit: /webkit/.test(userAgent),
        opera: /opera/.test(userAgent),
        msie: /msie/.test(userAgent) && !/opera/.test(userAgent),
        mozilla: /mozilla/.test(userAgent) && !/(compatible|webkit)/.test(userAgent)
    };
    //关于float的IE问题处理
    var styleFloat = jQuery.browser.msie ? "styleFloat" : "cssFloat";
    //关于CSS方面小小扩展一下 有些css值用JS操作并不是原来的 典型的"class"->"className"
    jQuery.extend({
        props: {
            "for": "htmlFor",
            "class": "className",
            "float": styleFloat,
            cssFloat: styleFloat,
            styleFloat: styleFloat,
            readonly: "readOnly",
            maxlength: "maxLength",
            cellspacing: "cellSpacing"
        }
    });
    var expando;
    //接下来先学习jQuery的事件处理 来源Dean Edwards' addEvent library
    //我想把它简化一下 可能效率会变差
    jQuery.event = {

        // Bind an event to an element
        // Original by Dean Edwards
        add: function (elem, types, handler, data) {
            //不处理文本和注释节点
            if (elem.nodeType == 3 || elem.nodeType == 8)
                return;

            //IE中, 如果把window对象作为函数参数传递的话往往不能正确传递(即函数内部根本不知道它是window对象).于是利用下面这个if来判断是不是在IE浏览器中以及检查传进来的elem会不会可能是window对象, 如果是, 就让elem引用重新指向window
            //因为只有window 有setInterval方法
            if (jQuery.browser.msie && elem.setInterval)
                elem = window;
            handler.data = data;
            jQuery.each(types.split(/\s+/), function (index, type) {
                // Namespaced event handlers
                var parts = type.split(".");
                type = parts[0];
                handler.type = parts[1];
                if (!jQuery.event.special[type] || jQuery.event.special[type].setup.call(elem) === false) {
                    // IE和其他浏览器兼容性
                    if (elem.addEventListener)
                        elem.addEventListener(type, handler, false);
                    else if (elem.attachEvent)
                        elem.attachEvent("on" + type, handler);
                }
            });

            // Nullify elem to prevent memory leaks in IE
            elem = null;
        },
        // 仍然把缓存机制取消了 简单化一下
        remove: function (elem, types, handler) {
            //不处理文本和注释节点
            if (elem.nodeType == 3 || elem.nodeType == 8)
                return;
            // Unbind all events for the element
            if (types == undefined || (typeof types == "string" && types.charAt(0) == "."))
                for (var type in types)
                    this.remove(elem, type + (types || ""));
            else {
                // Handle multiple events seperated by a space
                // jQuery(...).unbind("mouseover mouseout", fn);
                jQuery.each(types.split(/\s+/), function (index, type) {
                    // Namespaced event handlers
                    var parts = type.split(".");
                    type = parts[0];
                    if (!jQuery.event.special[type] || jQuery.event.special[type].teardown.call(elem) === false) {
                        if (elem.removeEventListener)
                            elem.removeEventListener(type, elem, false);
                        else if (elem.detachEvent)
                            elem.detachEvent("on" + type, elem);
                    }
                });
            }
        },
        //修正event 比较麻烦
        fix: function (event) {
            //如果事件已经包装过
            if (event[expando] == true)
                return event;
            //保存原来的event并且复制一个
            var originalEvent = event;
            event = {
                originalEvent: originalEvent
            };
            var props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view wheelDelta which".split(" ");
            for (var i = props.length; i; i--)
                event[props[i]] = originalEvent[props[i]];
            //标记它已经被包装过
            event[expando] = true;
            //下面大部分是兼容性处理
            // add preventDefault and stopPropagation since
            // they will not work on the clone
            event.preventDefault = function () {
                // if preventDefault exists run it on the original event
                if (originalEvent.preventDefault)
                    originalEvent.preventDefault();
                // otherwise set the returnValue property of the original event to false (IE)
                originalEvent.returnValue = false;
            };
            event.stopPropagation = function () {
                // if stopPropagation exists run it on the original event
                if (originalEvent.stopPropagation)
                    originalEvent.stopPropagation();
                // otherwise set the cancelBubble property of the original event to true (IE)
                originalEvent.cancelBubble = true;
            };

            // Fix timeStamp
            event.timeStamp = event.timeStamp || new Date();

            // Fix target property, if necessary
            if (!event.target)
                event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either

            // check if target is a textnode (safari)
            if (event.target.nodeType == 3)
                event.target = event.target.parentNode;

            // Add relatedTarget, if necessary
            if (!event.relatedTarget && event.fromElement)
                event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;

            // Calculate pageX/Y if missing and clientX/Y available
            if (event.pageX == null && event.clientX != null) {
                var doc = document.documentElement,
                    body = document.body;
                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
            }

            // Add which for key events
            if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode))
                event.which = event.charCode || event.keyCode;

            // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (!event.metaKey && event.ctrlKey)
                event.metaKey = event.ctrlKey;

            // Add which for click: 1 == left; 2 == middle; 3 == right
            // Note: button is not normalized, so don't use it
            if (!event.which && event.button)
                event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));

            return event;
        },
        //省略了其他special方法
        special: {
            ready: {
                setup: function () {
                    // Make sure the ready event is setup
                    bindReady();
                    return;
                },

                teardown: function () {
                    return;
                }
            }
        }
    };
    //添加到用户使用的接口上  
    jQuery.fn.extend({
        bind: function (type, data, fn) {
            /*为每一个匹配元素的特定事件（像click）绑定一个事件处理器函数。
	    这个事件处理函数会接收到一个事件对象，可以通过它来阻止（浏览器）默认的行为。
	    如果既想取消默认的行为，又想阻止事件起泡，这个事件处理函数必须返回false。多数情况下，可以把事件处理器函数定义为匿名函数。
	    在不可能定义匿名函数的情况下，可以传递一个可选的数据对象作为第二个参数（而事件处理器函数则作为第三个参数）。
		
	    内建事件类型值有: blur, focus, load, resize, scroll, unload, click, dblclick, mousedown, mouseup, mousemove, mouseover, mouseout, mouseenter, mouseleave, change, select, submit, keydown, keypress, keyup, error .*/

            return type == "unload" ? this.one(type, data, fn) : this.each(function () {
                jQuery.event.add(this, type, fn || data, fn && data);
            });
        },
        //把one方法 省略掉

        unbind: function (type, fn) {
            ///		bind()的反向操作，从每一个匹配的元素中删除绑定的事件。
            return this.each(function () {
                jQuery.event.remove(this, type, fn);
            });
        },
        hover: function (fnOver, fnOut) {
            return this.bind('mouseenter', fnOver).bind('mouseleave', fnOut);
        },

        ready: function (fn) {

            // Attach the listeners
            bindReady();
            // If the DOM is already ready
            if (jQuery.isReady)
            //已经ready就执行
                fn.call(document, jQuery);
            else
            // 添加到等待列队
                jQuery.readyList.push(function () {
                    return fn.call(this, jQuery);
                });

            return this;
        }
    });

    //Event的加载完成判断方法、
    jQuery.extend({
        isReady: false,
        readyList: [],
        // Handle when the DOM is ready
        ready: function () {
            // Make sure that the DOM is not already loaded
            if (!jQuery.isReady) {
                // Remember that the DOM is ready
                jQuery.isReady = true;
                // If there are functions bound, to execute
                if (jQuery.readyList) {
                    // Execute all of them
                    jQuery.each(jQuery.readyList, function () {
                        this.call(document);
                    });
                    jQuery.readyList = null;
                }
            }
        }
    });

    var readyBound = false;
    //判断是否加载完成的函数 可以剥离出来使用
    function bindReady() {

        if (readyBound) return;
        readyBound = true;

        // Mozilla, Opera (see further below for it) and webkit nightlies currently support this event
        if (document.addEventListener && !jQuery.browser.opera)
        // Use the handy event callback
            document.addEventListener("DOMContentLoaded", jQuery.ready, false);

        // If IE is used and is not in a frame
        // Continually check to see if the document is ready
        if (jQuery.browser.msie && window == top)(function () {
            if (jQuery.isReady) return;
            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            } catch (error) {
                setTimeout(arguments.callee, 0);
                return;
            }
            // and execute any waiting functions
            jQuery.ready();
        })();

        if (jQuery.browser.opera)
            document.addEventListener("DOMContentLoaded", function () {
                if (jQuery.isReady) return;
                for (var i = 0; i < document.styleSheets.length; i++)
                    if (document.styleSheets[i].disabled) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                    // and execute any waiting functions
                jQuery.ready();
            }, false);

        if (jQuery.browser.webkit) {
            var numStyles;
            (function () {
                if (jQuery.isReady) return;
                if (document.readyState != "loaded" && document.readyState != "complete") {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                if (numStyles === undefined)
                    numStyles = jQuery("style, link[rel=stylesheet]").length;
                if (document.styleSheets.length != numStyles) {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                // and execute any waiting functions
                jQuery.ready();
            })();
        }
        jQuery.event.add(window, "load", jQuery.ready);
    }
    //常用事件添加 例如可以使用$().click(function(){});
    jQuery.each(("blur,focus,load,resize,scroll,unload,click,dblclick," +
        "mousedown,mouseup,mousemove,mouseover,mouseout,change,select," +
        "submit,keydown,keypress,keyup,error").split(","), function (i, name) {
        jQuery.fn[name] = function (fn) {
            return fn ? this.bind(name, fn) : null;
        };
    });
    //jQuery ajax包装
    jQuery.extend({
        //HTTP get方法
        get: function (url, data, callback, type) {
            // shift arguments if data argument was ommited
            if (jQuery.isFunction(data)) {
                callback = data;
                data = null;
            }
            return jQuery.ajax({
                type: "GET",
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        },
        //HTTP　POST方法
        post: function (url, data, callback, type) {

            if (jQuery.isFunction(data)) {
                callback = data;
                data = {};
            }
            return jQuery.ajax({
                type: "POST",
                url: url,
                data: data,
                success: callback,
                dataType: type
            });
        },
        //获得JSON数据
        getJSON: function (url, data, callback) {
            return jQuery.get(url, data, callback, "json");
        },
        //设置全局 AJAX 默认选项。
        ajaxSetup: function (settings) {
            jQuery.extend(jQuery.ajaxSettings, settings);
        },
        ajaxSettings: {
            url: location.href,
            type: "GET",
            timeout: 0,
            contentType: "application/x-www-form-urlencoded",
            processData: true,
            async: true,
            data: null,
            username: null,
            password: null,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                json: "application/json, text/javascript",
                text: "text/plain",
                _default: "*/*"
            }
        },
        //为下一次请求缓存Last-Modified头部.
        lastModified: {},

        ajax: function (s) {
            //两次继承s
            s = jQuery.extend(true, s, jQuery.extend(true, {}, jQuery.ajaxSettings, s));
            var status, data, type = s.type.toUpperCase();

            //我把jsonp和script取消了，可惜了 可以直接在页面上插入script来完成跨域

            // If data is available, append data to url for get requests
            if (s.data && type == "GET") {
                s.url += (s.url.match(/\?/) ? "&" : "?") + s.data;
                // IE likes to send both get and post data, prevent this
                s.data = null;
            }

            var requestDone = false;

            //比较简单的创建请求对象;微软在IE7上并没有正确地实现XMLHttpRequest
            var xhr = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();

            // Open the socket
            // 只是说open用于初始化一个准备发起仍在'pending'状态中的请求
            if (s.username)
                xhr.open(type, s.url, s.async, s.username, s.password);
            else
                xhr.open(type, s.url, s.async);

            // Need an extra try/catch for cross domain requests in Firefox 3
            try {

                //// 如果需要一个过期头, 那就设置这个过期头.过期头所标识的日期一般用于浏览器的缓存设置. 
                if (s.ifModified)
                    xhr.setRequestHeader("If-Modified-Since",
                        jQuery.lastModified[s.url] || "Thu, 01 Jan 1970 00:00:00 GMT");

                // 设置头部,以便能使服务器知道这是一个通过XMLHttpRequest发送的请求.
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

                //设置接收数据的类型
                xhr.setRequestHeader("Accept", s.dataType && s.accepts[s.dataType] ?
                    s.accepts[s.dataType] + ", */*" :
                    s.accepts._default);
            } catch (e) {}

            //等待返回的请求
            var onreadystatechange = function (isTimeout) {
                // The transfer is complete and the data is available, or the request timed out
                if (!requestDone && xhr && (xhr.readyState == 4 || isTimeout == "timeout")) {
                    requestDone = true;

                    // clear poll interval
                    if (ival) {
                        clearInterval(ival);
                        ival = null;
                    }
                    status = isTimeout == "timeout" && "timeout" || !jQuery.httpSuccess(xhr) && "error" || s.ifModified && jQuery.httpNotModified(xhr, s.url) && "notmodified" || "success";
                    if (status == "success") {
                        // Watch for, and catch, XML document parse errors
                        try {
                            // process the data (runs the xml through httpData regardless of callback)
                            data = jQuery.httpData(xhr, s.dataType, s.dataFilter);
                        } catch (e) {
                            status = "parsererror";
                        }
                    }

                    //如果设置了ifModified为true,对响应头进行缓存
                    //下次请求相同url的时候可以看看请求的页面的修改日期是否晚过这个日期 
                    if (status == "success") {
                        // Cache Last-Modified header, if ifModified mode.
                        var modRes;
                        try {
                            modRes = xhr.getResponseHeader("Last-Modified");
                        } catch (e) {} // swallow exception thrown by FF if header is not available

                        if (s.ifModified && modRes)
                            jQuery.lastModified[s.url] = modRes;
                        success();
                    } else
                        jQuery.handleError(s, xhr, status);


                    // 触发complete事件, 运行绑定在这个事件上事件监听函数
                    complete();

                    // 把xhr设为null, 让垃圾回收器对xhr进行回收,防止内存泄漏
                    if (s.async)
                        xhr = null;
                }
            };
            //如果是异步的请求, 设置请求重试, 一次不成功就再来直到成功或者超时
            if (s.async) {
                // don't attach the handler to the request, just poll it instead
                var ival = setInterval(onreadystatechange, 13);

                // Timeout checker
                if (s.timeout > 0)
                    setTimeout(function () {
                        // 如果xhr不为null, 说明请求正在进行,取消这次请求, 因为超时了
                        if (xhr) {
                            // Cancel the request
                            xhr.abort();
                            //如果请求还没完成,马上调用函数这样requestDone为true
                            if (!requestDone)
                                onreadystatechange("timeout");
                        }
                    }, s.timeout);
            }

            //发送请求
            try {
                xhr.send(s.data);
            } catch (e) {
                jQuery.handleError(s, xhr, null, e);
            }

            //在firefox 1.5中,同步请求并不能触发statechange事件.所以手动触发
            if (!s.async)
                onreadystatechange();

            function success() {
                // If a local callback was specified, fire it and pass it the data
                if (s.success)
                    s.success(data, status);
            }

            function complete() {
                // Process result
                if (s.complete)
                    s.complete(xhr, status);
            }
            // return XMLHttpRequest to allow aborting the request etc.
            return xhr;
        },
        //jQuery.ajax方法中出现的错误处理函数
        handleError: function (s, xhr, status, e) {
            // If a local callback was specified, fire it
            if (s.error) s.error(xhr, status, e);
        },
        //判断当前这个请求是否是成功
        httpSuccess: function (xhr) {
            try {
                // IE有一个错误, 那就是有时候应该返回204(No Content)但是它却返回1223
                //safari在文档没有修改时(304)得到的status会等于undefined,所以把这种情况也当作是成功
                return !xhr.status && location.protocol == "file:" ||
                    (xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || xhr.status == 1223 ||
                    jQuery.browser.webkit && xhr.status == undefined;
            } catch (e) {}
            return false;
        },
        //判断请求回来的服务器响应是不是"NotModified".
        httpNotModified: function (xhr, url) {
            try {
                var xhrRes = xhr.getResponseHeader("Last-Modified");
                //Firefox 总是返回200. 还是对比一下Last-Modified的日期稳妥一些.
                return xhr.status == 304 || xhrRes == jQuery.lastModified[url] ||
                    jQuery.browser.webkit && xhr.status == undefined;
            } catch (e) {}
            return false;
        },
        /*获取XMLHTTPRequest的响应数据.允许对数据使用自定义的函数进行预处理.并根据用户提供的数据类型对响应数据做不同的处理. 最后将数据返回.*/
        httpData: function (xhr, type, filter) {
            var ct = xhr.getResponseHeader("content-type"),
                xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0,
                data = xml ? xhr.responseXML : xhr.responseText;
            if (xml && data.documentElement.tagName == "parsererror")
                throw "parsererror";
            // Get the JavaScript object, if JSON is used.
            if (type == "json")
                data = eval("(" + data + ")");
            return data;
        }
    });
    //扩展增加jQuery的
    
    // 使用jQuery的原型覆盖init的原型 这样就自动把jQuery.prototype的方法可以在init里面使用
    jQuery.fn.init.prototype = jQuery.fn;
})(window);