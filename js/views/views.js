//individual item view
var FoodItemView = Backbone.View.extend({

    tagName: "li",

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);


    },

    render: function() {
        this.$el.html(this.model.get('servings')+" " + this.model.get('food')+ ": " + this.model.get('calories') + " calories");

        return this;
    },
});


//global app view
var AppView = Backbone.View.extend({
    el: $('#foodapp'),
    events: {
        "click button#add-food": "createFood",
        "click button#reset": "reset"
    },
    initialize: function() {
        this.list = $("#food-list");
        this.input = $("#new-food");


        //listen to changes in order to change in realtime
        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'sync', this.render)
    this.render();
    },
    addOne: function(FoodItem) {
        var view = new FoodItemView({
            model: FoodItem
        });
        this.list.append(view.render().el);
    },
    createFood: function(e) {
        if (!this.input.val()) {
            return;
        }


        //create a new location in Firebase and save model data
        //also trigger the listenTo method to create a new foodItemView

        this.collection.create({
            food: this.input.val(),
            servings: $("#servings").val(),
            calories: ((Math.random() * (1000 - 1) + 1) * $("#servings").val())

        });
        this.input.val('');
    },

        reset: function() {
        this.collection.reset();

    },

    render: function(){
        this.collection.each(function(foodItem){
            console.log(foodItem);

        });
    }
});

//init App!
function init() {

    //synced data from remote DB
    var collection = new FoodCollection();
    var app = new AppView({
        collection: collection
    });
}

//when doc is ready (check using jQuery), init!
$(function() {
    init();
});
