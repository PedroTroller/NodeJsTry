(function($, _, Backbone, io)
{

    window.clients = null;

    window.Client = Backbone.Model.extend({});

    window.Message = Backbone.Model.extend({});

    window.ClientList = Backbone.Collection.extend({

        model: Client

    });

    window.MessageList = Backbone.Collection.extend({

        model: Message

    });

    window.ClientView = Backbone.View.extend({

        initialize: function()
        {
            this.template = _.template($('#client-template').html());
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },

        render: function(){
            $(this.el).html( this.template(this.model.toJSON()) );
            return this;
        }
    });

    window.ClientListView = Backbone.View.extend({

        initialize: function()
        {
            this.template = _.template('');
            _.bindAll(this, 'render');
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('change', this.render);
        },

        render: function(){
            var collection = this.collection;
            var $target = $('<div></div>');
            collection.each(function(client)
            {
                if(client.get('connected')){
                    var view = new ClientView({
                        model:      client,
                        collection: collection
                    });
                    $target.prepend($(view.render().el));
                }
            });
            $(this.el).html($target.html());
            return this;
        }
    });

    window.MessageView = Backbone.View.extend({

        initialize: function()
        {
            this.template = _.template($('#message-template').html());
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
        },

        render: function(){
            $(this.el).html( this.template(this.model.toJSON()) );
            return this;
        }
    });

    window.MessageListView = Backbone.View.extend({

        initialize: function()
        {
            this.template = _.template('');
            _.bindAll(this, 'render');
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('change', this.render);
        },

        render: function(){
            var collection = this.collection;
            var $target = $('<div></div>');
            collection.each(function(message)
            {
                var view = new MessageView({
                    model:      message,
                    collection: collection
                });
                $target.prepend($(view.render().el));
            });
            $(this.el).html($target.html());
            return this;
        }
    });

    window.clientList = new ClientList();
    window.messageList = new MessageList();
    window.clientListView = new ClientListView({ collection: clientList });
    window.messageListView = new MessageListView({ collection: messageList });

    io.on('message', function(data) {
        messageList.add(new Message({ type: 'success', pseudo: data.pseudo, message: data.message }));
    });

    io.on('notice', function(data) {
        messageList.add(new Message({ type: 'info', pseudo: data.message, message: '' }));
    });

    io.on('error', function(data) {
        messageList.add(new Message({ type: 'important', pseudo: data.message, message: '' }));
    });

    io.on('clients', function(data) {
        console.log(data);
        window.clients = data;
        _.each(data, function(c){
            client = clientList.get(c.id);
            if(client){
                client.set(c);
            }else{
                client = new Client(c);
                clientList.add(client);
            }
        });
    });

    $("#chat_list").html(clientListView.render().el);
    $("#chat_box").html(messageListView.render().el);

    $('.sendButton').click(function(event)
    {

        event.preventDefault();

        io.emit('message', {
            pseudo: $('#pseudo').val(), 
            message: $('#message').val()
        });

        $('#message').val('');
        $('#message').focus();

    });

    $("#message").keypress(function (e) {
        if(e.which == 13){
            $('.sendButton').click();
        }
    });

    $('#pseudo').change(function(){
        io.emit('pseudo', {
            pseudo: $(this).val()
        });
    });

})(jQuery, _, Backbone, io.connect('http://localhost:8800'));