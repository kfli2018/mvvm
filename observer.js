//  数据劫持
function Observer(data){
    this.data = data;
    this.walk(data);
}
Observer.prototype = {
    // 取出所有属性遍历
    walk: function(data) {
        var me = this;
        Object.keys(data).forEach(function(key) {
            me.convert(key, data[key]);
        });
    },
    convert: function(key, val) {
        this.defineReactive(this.data, key, val);
    },
    //  便利属性，增加数据劫持
    defineReactive:function (data,key,val){
        var dep = new Dep();
        // 递归监听子属性
        var childObj = observe(val);
        //  修改get/set方法实现数据劫持
        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function() {
                // 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
                if (Dep.target) {
                    console.log('get-',val,dep)
                    dep.depend();
                }
                return val;
            },
            set: function(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                console.log('set-',val,newVal,dep)
                // 新的值是object的话，进行监听
                childObj = observe(newVal);
                // 通知订阅者
                dep.notify();
            }
        });
    }
}


function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }

    return new Observer(value);
};

var uid = 0;
//  消息订阅器
function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },
    depend: function() {
        Dep.target.addDep(this);
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if (index != -1) {
            this.subs.splice(index, 1);
        }
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};
//  全局变量
Dep.target = null
