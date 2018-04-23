(function($, Backbone, _, app){
    //发送CSRF记号代码片段，从Django文档中可以直接获得
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    // using jQuery
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    // Setup jQuery ajax calls to handle CSRF
    $.ajaxPrefilter(function (settings, originalOptions, xhr) {
        var csrftoken;
        if(!csrfSafeMethod(settings.type) && !this.crossDomain){
            //Send a token to same-origin, related URLs only
            //Send a token only if the method warrantsCSRF protection
            //Using the CSRFToken value acquired earlier
            csrftoken = getCookie('csrftoken');
            xhr.setRequestHeader('X-CSRFToken',csrftoken);
        }
    });

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                var csrftoken = getCookie('csrftoken');
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    //CSRF记号代码片段

    // 创建会话模型，注意最后需要将Sessoin加入到app中供应用使用。
    var Session = Backbone.Model.extend({
        //将记号变量设置为默认的空值
        defaults: {
            token:null
        },
        initialize: function(options){
            this.options = options;
            // 在实例话会话模型之前，检查用户是否已经被验证过
            $.ajaxPrefilter($.proxy(this._setupAuth, this));
            this.load();
        },
        load: function(){
            //这里使用基于localStorage中捕获的数值记号的初始设置
            var token = localStorage.apiToken;
            if(token){
                this.set('token',token);
            }
        },
        save:function(token){
            this.set('token',token);
            // 检查是否时真实的记号数值。如果不是，移除该数值并对用户取消授权
            if(token === null){
                localStorage.removeItem('apiToken');
            }else{
                localStorage.apiToken = token;
            }
        },
        delete: function () {
            this.save(null)
        },
        // 查看当前模型实例下记号是否存在
        authenticated: function(){
            var s = this.get('token');
            return this.get('token') !== null;
        },
        // 该方法会检查验证，并通过验证后将记号传入我们XMLHttpRequest的头信息参数中
        _setupAuth:function (settings, originalOptions, xhr) {
            if(this.authenticated()){
                var token = this.get('token');
                //TODO 修改验证方法为动态获取
                // xhr.setRequestHeader('Authorization','Token '+this.get('token'));
                xhr.setRequestHeader('Authorization','Basic c2NydW06c2NydW0xMjM0NTY=');
            }
        }
    });
    // 自定义基础模型，主要作用时先从links属性中查找self属性，
    // 如果API没有给出URL，则使用原始的backbone方法创建它
    var BaseModel = Backbone.Model.extend({
        url: function () {
            var links = this.get('link'),
                url = links && links.self;
            if(!url){
                url = Backbone.Model.prototype.url.call(this);
            }
            return url;
        }
    });
    // 为每一个模型创建存根代码
    app.models.Sprint = BaseModel.extend({
        fetchTasks: function () {
            var links = this.get('links');
            if(links && links.tasks){
                app.tasks.fetch({url: links.tasks, remove: false});
            }
        }
    });
    app.models.Task = BaseModel.extend({
        statusClass: function () {
            var sprint = this.get('sprint'),
                status;
            if(!sprint){
                status = 'unassigned';
            }else{
                status = ['todo', 'active', 'testing', 'done'][this.get('status') - 1];
            }
            return status;
        },
        inBacklog: function () {
            return !this.get('sprint');
        },
        inSprint: function (sprint) {
            return sprint.get('id') == this.get('sprint');
        }
    });
    app.models.User = BaseModel.extend({idAttributemodel: 'username'});

    var BaseCollection = Backbone.Collection.extend({
        // parse: function (response) {
        //     this._next = response.next;
        //     this._previous = response.previous;
        //     this._count = response.count;
        //     return response.results || [];
        // },
        getOrFetch: function (id) {
            var result = new $.Deferred(),
                model = this.get(id);
            if(!model){
                model = this.push({id: id});
                model.fetch({
                    success: function (model, response, options) {
                        result.resolve(model);
                    },
                    error: function (model, response, options) {
                        result.reject(model, response);
                    }
                });
            } else {
                result.resolve(model);
            }
            return result;
        }
    });
    // 获取api的根节点，AJAX延时对象存储在app.collections.ready中。
    app.collections.ready = $.getJSON(app.apiRoot);
    // 资源返回时，结果URL被用于创建每个集合。其中data是字典，data.sprints=http://127.0.0.1:8000/api/sprints/1...
    app.collections.ready.done(function(data){
        app.collections.Sprints = BaseCollection.extend({
            model: app.models.Sprint,
            url: data.sprints
        });
        app.sprints = new app.collections.Sprints();

        app.collections.Tasks = Backbone.Collection.extend({
            model: app.models.Task,
            url: data.tasks,
            getBacklog: function () {
                this.fetch({remove: false, data: {backlog: 'True'}});
            }
        });
        app.tasks = new app.collections.Tasks();

        app.collections.Users = Backbone.Collection.extend({
            model: app.models.User,
            url: data.users
        });
        app.users = new app.collections.Users();

    });
    // 代码创建一个供应用使用的会话模型
    app.session = new Session();
})(jQuery, Backbone, _, app)
