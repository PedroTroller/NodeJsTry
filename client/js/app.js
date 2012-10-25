(function($, _, Backbone, io)
{

    window.Message = Backbone.Model.extend({});

    window.MessageList = Backbone.Collection.extend({

        model: Message

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
    })

    window.MessageListView = Backbone.View.extend({

        initialize: function()
        {
            this.template = _.template('');
            _.bindAll(this, 'render');
            this.collection.bind('reset', this.render);
            this.collection.bind('add', this.render);
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
    })

    window.list = new MessageList();
    window.listView = new MessageListView({ collection: list })

    io.on('message', function(data) {
        list.add(new Message({ type: 'success', pseudo: data.pseudo, message: data.message }));
    });

    io.on('notice', function(data) {
        list.add(new Message({ type: 'info', pseudo: data.message, message: '' }));
    });

    io.on('error', function(data) {
        list.add(new Message({ type: 'important', pseudo: data.message, message: '' }));
    });

    $("#chat_box").html(listView.render().el);

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
        io.emit('notice', {
            message: 'Name changed to ' + $(this).val()
        });
    });

})(jQuery, _, Backbone, io.connect('http://localhost:8800'));