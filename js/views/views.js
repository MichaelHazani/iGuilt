//individual item view
var FoodItemView = Backbone.View.extend({


    tagName: "li",

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);


    },

    render: function() {
        this.$el.html(this.model.toJSON());

        return this;
    },
});


//global app view
var AppView = Backbone.View.extend({
    el: $('#foodapp'),
    events: {
        "click #add-food": "createFood"
    },
    initialize: function() {
        this.list = $("#food-list");
        this.input = $("#new-food");


        //listen to changes in order to change in realtime
        this.listenTo(this.collection, 'add', this.addOne);
    },
    addOne: function(food) {
        var view = new FoodItemView({
            model: food
        });
        this.list.append(view.render().el);
    },
    createFood: function(e) {
        if (!this.input.val()) {
            return;
        }
        console.log("hi");

        //create a new location in Firebase and save model data
        //also trigger the listenTo method to create a new foodItemView

        this.collection.create({
            food: this.input.val(),
            servings: $("#servings").val()
            // calories: ((Math.random() * (1000 - 1) + 1) * $("#servings").val())
        });
        this.input.val('');
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
