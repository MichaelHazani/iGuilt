var app = app || {};

//global date and formatted currentDate objects
var DATE = new Date();
var FORMATTEDDATE = (DATE.getMonth() + 1 + "/" + DATE.getDate() + "/" + DATE.getFullYear());

//individual item view
var FoodItemView = Backbone.View.extend({

    tagName: "li",

    events: {
        "click button#destroy": "destroy"
    },



    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);

    },

    destroy: function() {
        this.model.destroy();
        $("#new-food").focus();
    },

    render: function() {

        if (this.model.get('date') == $("#gldate").val()) {
            this.$el.html(this.model.get('date') + " " + this.model.get('servings') + " servings of " + this.model.get('food') + ": " + this.model.get('calories') + " calories" + "<button id='destroy' class='libut pull-right'>Delete</button><br>");
        }
        return this;
    },
    test: function() {
        console.log("hi")
    }
});


//global app view
var AppView = Backbone.View.extend({

    el: $('#foodapp'),
    collection: new FoodCollection(),
    events: {
        "click button#add-food": "createFood",
        "click button#reset": "reset",
        "keyup #new-food": "autoComplete",
    },
    initialize: function() {
        var that = this;
        this.list = $("#food-list");
        this.input = $("#new-food");
        this.servings = $("#servings")
        this.glDate = $(".gldate");
        this.input.focus();

        //listen to changes in order to change in realtime
        this.listenTo(this.collection, 'add', this.addOne);

        $("#gldate").glDatePicker({
        onClick: (function(el, cell, date, data) {
            el.val(date.toLocaleDateString());
        // $(window).remove(AppView);
        //     // var app = new AppView();
        }),
});
$("#gldate").val(FORMATTEDDATE);

    },
    addOne: function(FoodItem) {
        var view = new FoodItemView({
            model: FoodItem
        });
        this.list.append(view.render().el);
    },

    addAll: function() {
        this.collection.each(this.addOne, this);
    },

    createFood: function() {
        if (!this.input.val() || !this.servings.val()) {
            alert("please enter all required fields");
            return;
        }
        //create a new location in Firebase and save model data
        //also trigger the listenTo method to create a new foodItemView

        this.collection.create({
            date: this.glDate.val(),
            food: this.input.val(),
            servings: $("#servings").val(),
            calories: ($("#calories").val() * $("#servings").val())

        });
        this.input.val('');
    },

    createOnEnter: function(e) {
        if (e.keyCode != 13) {
            return;
        }
        this.createFood();
    },

    autoComplete: function(e) {

        if (e.keyCode === 13) {
            this.createFood();
        } else {
            if (this.input.val()) {

                var query = (this.input.val()).replace(" ", "%20");
                $.get("https://api.nutritionix.com/v1_1/search/" + query + "?cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=45f49ec8&appKey=a9b61e8c715b3753b743ca2bbd19d509",
                    function(data) {
                        $("#autocomplete").html("");
                        if (data.length != 0) {
                            for (var i = 0; i < data.hits.length; i++) {
                                $("#autocomplete").append("<li id=" + i + ">" + (data.hits[i]['fields']['item_name']) + ", by " + (data.hits[i]['fields']['brand_name']) + "</li><br>");
                            }
                            $("#autocomplete").click(function(e) {
                                $("#new-food").val(e.target.innerText);
                                $.get("https://api.nutritionix.com/v1_1/item?id=" + data.hits[e.target.id]["_id"] + "&appId=45f49ec8&appKey=a9b61e8c715b3753b743ca2bbd19d509",
                                    function(itemData) {
                                        var totalCal = (itemData["nf_calories"]);
                                        $("#calories").val(totalCal);
                                    });
                                $("#autocomplete").html("");
                            });
                        }
                    }).fail(function() {
                    $("#autocomplete").html("");
                });
            } else {
                $("#autocomplete").html("");
            }
        }
    },

    reset: function() {
        this.collection.reset();
        this.list.html("");
        this.input.focus();
    },

    render: function() {
        this.collection.each(function(foodItem) {
            foodItem.render();
        });
    }
});

//init App!
function init() {

    //synced data from remote DB
    var app = new AppView();



}

//when doc is ready (check using jQuery), init!
$(function() {
    init();
});
