(function($, Backbone, _, app){
    var AppRouter = Backbone.Router.extend(
        {
            // 定义路由的地方
            routes: {
                '': 'home',
                'sprint/:id': 'sprint'
            },
            initialize: function (options) {
                // Underscore模版将要加载的地方，通过ID选择器实现
                this.contentElement = '#content';
                this.current = null;

                this.header = new app.views.HeaderView();
                $('body').prepend(this.header.el);
                this.header.render();

                Backbone.history.start();
            },
            home: function () {
                var view = new app.views.HomepageView({el: this.contentElement});
                this.render(view);
            },
            sprint: function (id) {
                var view = new app.views.SprintView({
                    el: this.contentElement,
                    sprintId: id
                });
                this.render(view);
            },
            route: function (route, name, callback) {
                // override default route to enforce login on every page
                var login;
                callback = callback || this[name];
                // 原始的回调函数会被封装起来，用于在调用之前对验证状态做初始检查
                callback = _.wrap(callback, function (original) {
                    var args = _.without(arguments, original);
                    if(app.session.authenticated()){
                        // 如果用户通过验证，将会简单地调用原先的回调
                        original.apply(this,args);
                    }else {
                        // show the login screen before calling the view
                        $(this.contentElement).hide();
                        // bind original callback once the login is successful
                        login = new app.views.LoginView();
                        $(this.contentElement).after(login.el);
                        login.on('done',function(){
                            this.header.render();
                            $(this.contentElement).show();
                            original.apply(this, args);
                        },this);
                        // Render the login form
                        login.render();
                    }
                });
                return Backbone.Router.prototype.route.apply(this,[route,name,callback]);
            },
            // 帮助函数，用于从一个视图切换到另一个视图时帮助路由追踪
            render: function (view) {
                if (this.current){
                    this.current.undelegateEvents();
                    this.current.$el = $();
                    this.current.remove();
                }
                this.current = view;
                this.current.render();
            }
        });
    // 将路由定义附加到app配置当中，让它在整个项目范围内可用
    app.router = AppRouter;
})(jQuery, Backbone, _, app)
