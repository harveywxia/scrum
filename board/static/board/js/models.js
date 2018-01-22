(function($, Backbone, _, app){
    //发送CSRF记号代码片段，从Django文档中可以直接获得
    function csrfSafeMethod(method){
        return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method))
    }
    function getCoookie(name){
        var cookieValue = null;
        if(document.cookie && document.cookie != ''){
            var cookies = document.cookie.split(';');
            for(var i = 0; i<cookies.length; i++){
                var cookie = $.trim(cookies[i]);
                //Does this cookie string begin with the name we want?
                if(cookie.substring(0, name.length+1) == (name + '=')){
                    cookieValue = decodeURIComponent(cookie.substring(name.length+1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    // Setup jQuery ajax calls to handle CSRF
    $.ajaxPrefilter(function (settings, originaloptions, xhr) {
        var csrftoken;
        if(!csrfSafeMethod(settings.type) && !this.crossDomain){
            //Send a token to same-origin, related URLs only
            //Send a token only if the method warrantsCSRF protection
            //Using the CSRFToken value acquired earlier
            csrftoken = getCoookie('csrftoken');
            xhr.setRequestHeader('X-CSRFToken',csrftoken);
        }
    });
    //CSRF记号代码片段

    var Session = Backbone.Model.extend({
        defaults: {
            token:null
        },
        initialize: function(options){
            this.options = options;
            $.ajaxPrefilter($.proxy(this._setupAuth, this));
            this.load();
        },
        load: function(){
            var token = localStorage.apiToken;
            if(token){
                this.set('token',token);
            }
        },
        save:function(token){
            this.set('token',token);
            if(token === null){
                localStorage.removeItem('apiToken');
            }else{
                localStorage.apiToken = token;
            }
        },
        delete: function () {
            this.save(null)
        },
        authenticated: function(){
            return this.get('token') !== null;
        },
        _setupAuth:function (settings, originalOptions, xhr) {
            if(this.authenticated()){
                xhr.setRequestHeader(
                    'Authorization',
                    'Token ' + this.get('token')
                );
            }
        }
    });
    app.session = new Session();
})(jQuery, Backbone, _, app)
