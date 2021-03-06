//自调函数把window这个全局变量传入
(function() {
    // 把jQuery和$另存一份 以便发生冲突的时候再使用
    var _jQuery = window.jQuery,
    _$ = window.$;
    // 在上次的代码上添加选择器机制
    var jQuery = window.jQuery = window.$ = function(selector, context) {
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

        init: function(selector, context) {
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
        html: function(val) {
            // 遍历通过回调函数来设置innerHTML为val参数
            return jQuery.each(this,
            function(val) {
                this.innerHTML = val;
            },
            val);
        },
        length: 0,
        jquery: "1.0.0",
        author: "BaiQiang",
        size: function() {
            return this.length;
        },
        //直接调用jQuery静态函数
        each: function(callback, args) {
            return jQuery.each(this, callback, args);
        },
        //扩展一些有用的方法
        setArray: function(elems) {
            this.length = 0;
            Array.prototype.push.apply(this, elems);
            return this;
        },

        attr: function(name, value, type) {
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
            return this.each(function(i) {
                // Set all the styles
                for (name in options) jQuery.attr(type ?
                //如果有传入type,就表示要设置样式属性;如果没有则表示要设置一般的属性
                this.style: this, name, jQuery.prop(this, options[name], type, i, name));
            });
        },
        css: function(key, value) {
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
    jQuery.extend = jQuery.fn.extend = function() {
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
            target = this; --i;
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
        getName: function() {
            return "This is BaiQiang's jQuery";
        },
        noConflict: function(deep) {
            // 扩展jQuery对象本身。
            // 使用这个函数必须以jQuery 开头，不能用$开头
            // 把保存的_$还回给$
            window.$ = _$;
            if (deep) window.jQuery = _jQuery;
            return jQuery;
        },
        // 判断传入的参数是否一个函数
        isFunction: function(fn) {
            return typeof fn == "function";
            // 简写一下,不用jQuery的方法
            // return !!fn && typeof fn != "string" && !fn.nodeName &&
            // fn.constructor != Array && /^[\s[]?function/.test( fn +
            // "" );
        },
        // 判断参数是否为一个XML节点
        isXMLDoc: function(elem) {
            // body是HTMLDocument特有的节点常用这个节点来判断当前的document是不是一个XML的文档引用
            return elem.documentElement && !elem.body || elem.tagName && elem.ownerDocument && !elem.ownerDocument.body;
        },
        trim: function(data) {
            // 第一部分^\s第二部分\s+$ 替换为空
            return (data || "").replace(/^\s+|\s+$/g, "");
        },
        // 在全局的作用域中运行脚本
        globalEval: function(data) {
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
        each: function(object, callback, args) {
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
                } else for (; i < length;) if (callback.apply(object[i++], args) === false) break;

                // A special, fast, case for the most common use of each
                // 没有参数的调用call和apply不同的就是参数传入的是下标或属性以及代表的值
            } else {
                if (length == undefined) {
                    for (name in object) if (callback.call(object[name], name, object[name]) === false) break;
                } else for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) {}
            }
            return object;
        },
        //属性操作 CSS操作也用到
        attr: function(elem, name, value) {
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
                return attr === null ? undefined: attr;
            }
            //并非设值而是把匹配到的字符转成大写,实际上是想做这样的效果:"margin-Top" -> "marginTop"
            name = name.replace(/-([a-z])/ig,
            function(all, letter) {
                return letter.toUpperCase();
            });
            //set设置值
            if (set) elem[name] = value;
            return elem[name];
        },
        // 再写一些对array操作的扩展
        makeArray: function(array) {
            // 将类数组对象转换为数组对象。
            // 类数组对象有 length 属性，其成员索引为 0 至 length - 1。实际中此函数在 jQuery
            // 中将自动使用而无需特意转换。
            var ret = [];
            if (array != null) {
                var i = array.length;
                // the window, strings and functions also have 'length'
                // 排除null window string function..
                if (i == null || array.split || array.setInterval || array.call) ret[0] = array;
                else while (i) ret[--i] = array[i];
            }
            return ret;
        },
        inArray: function(elem, array) {
            // 确定第一个参数在数组中的位置(如果没有找到则返回 -1 )
            for (var i = 0,
            length = array.length; i < length; i++)
            // Use === because on IE, window == document
            if (array[i] === elem) return i;
            return - 1;
        },
        // 把两个数组拼接起来(将第二个数组接到第一个数组的尾部)
        merge: function(first, second) {
            // We have to loop this way because IE & Opera overwrite the
            // length expando of getElementsByTagName
            var i = 0,
            elem, pos = first.length;
            // Also, we need to make sure that the correct elements are
            // being returned
            // 在一个使用'*'的选择器中,IE会返回注释节点.
            if (jQuery.browser.msie) {
                while (elem = second[i++]) if (elem.nodeType != 8) first[pos++] = elem;
            } else while (elem = second[i++]) first[pos++] = elem;
            return first;
        },
        // 数组去重 面试还考过
        unique: function(array) {
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
            } catch(e) {
                // 遇到问题就返回原来的数组
                ret = array;
            }
            return ret;
        },
        // 过滤数组元素 参见ES5的 fliter
        grep: function(elems, callback, inv) {
            // (可选) 如果 "invert" 为 false 或为设置，则函数返回数组中由过滤函数返回 true 的元素，
            // / 当"invert" 为 true，则返回过滤函数中返回 false 的元素集。
            var ret = [];
            // Go through the array, only saving the items
            // that pass the validator function
            for (var i = 0,
            length = elems.length; i < length; i++) if (!inv != !callback(elems[i], i)) ret.push(elems[i]);
            return ret;
        },
        // 参见ES5中的map不解释
        map: function(elems, callback) {
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
        nodeName: function(elem, name) {
            //检查指定的元素里是否有指定的DOM节点的名称。
            ///	<param name="elem" type="Element">要检查的元素</param>
            ///	<param name="name" type="String">要确认的节点名称</param>
            ///	<returns type="Boolean">如果指定的节点名称匹配对应的节点的DOM节点名称返回true; 否则返回 false</returns>
            return elem.nodeName && elem.nodeName.toUpperCase() == name.toUpperCase();
        },
        //学习jQuery如何处理字符串为DOM元素  其实还没有全明白
        clean: function(elems, context) {
            var ret = [];
            context = context || document;
            // !context.createElement fails in IE with an error but returns typeof 'object'
            if (typeof context.createElement == 'undefined') context = context.ownerDocument || context[0] && context[0].ownerDocument || document;

            jQuery.each(elems,
            function(i, elem) {
                //直接返回
                if (!elem) return;
                //数字直接转字符串
                if (elem.constructor == Number) elem += '';
                // 字符串的话就转为DOM元素 
                if (typeof elem == "string") {
                    // Fix "XHTML"-style tags in all browsers
                    elem = elem.replace(/(<(\w+)[^>]*?)\/>/g,
                    function(all, front, tag) {
                        return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? all: front + "></" + tag + ">";
                    });

                    // Trim whitespace, otherwise indexOf won't work as expected
                    var tags = jQuery.trim(elem).toLowerCase(),
                    div = context.createElement("div");

                    var wrap =
                    // option or optgroup
                    ! tags.indexOf("<opt") && [1, "<select multiple='multiple'>", "</select>"] ||

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
                        var tbody = !tags.indexOf("<table") && tags.indexOf("<tbody") < 0 ? div.firstChild && div.firstChild.childNodes:

                        // String was a bare <thead> or <tfoot>
                        wrap[1] == "<table>" && tags.indexOf("<tbody") < 0 ? div.childNodes: [];
                        for (var j = tbody.length - 1; j >= 0; --j) if (jQuery.nodeName(tbody[j], "tbody") && !tbody[j].childNodes.length) tbody[j].parentNode.removeChild(tbody[j]);
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
        prop: function(elem, value, type, i, name) {

            if (jQuery.isFunction(value)) value = value.call(elem, i);
            // 对于CSS属性自动+'px'
            return value && value.constructor == Number && type == "curCSS" && !exclude.test(name) ? value + "px": value;
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
    var styleFloat = jQuery.browser.msie ? "styleFloat": "cssFloat";
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
    // 使用jQuery的原型覆盖init的原型 这样就自动把jQuery.prototype的方法可以在init里面使用
    jQuery.fn.init.prototype = jQuery.fn;
})(window);