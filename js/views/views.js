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
        this.totalCal();
    },

    totalCal: function() {
            var calTotal = 0;
            $('.DOMcals').each(function() {
                calTotal += parseFloat($(this).text());
            })
                $(".calTotal").text(calTotal);
            },
    render: function() {

        if (this.model.get('date') == $("#gldate").val()) {
            this.$el.html(this.model.get('servings') + " servings of " + this.model.get('food') +
                ": <span class='DOMcals'>" + this.model.get('calories') + "</span> calories" +
                "<button id='destroy' class='libut pull-right'>Delete</button><br>");
        }
        return this;
    },
});


//global app view
var AppView = Backbone.View.extend({
    el: $('#foodapp'),
    collection: foodCollection,
    events: {
        "click button#add-food": "createFood",
        "click button#reset": "reset",
        "keyup #new-food": "autoComplete",
    },
    initialize: function() {
        var that = this;
        this.list = $("#food-list");
        this.input = $("#new-food");
        this.servings = $("#servings");
        this.calories = $("#calories");
        this.glDate = $("#gldate");
        this.input.focus();

        //listen to changes in order to change in realtime
        this.listenTo(this.collection, 'sync', this.totalCal);
        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.model, 'destroy', this.totalCal);

        $("#gldate").glDatePicker({
            onClick: (function(el, cell, date, data) {
                el.val(date.toLocaleDateString());
                // console.log(date.toLocaleDateString());
                that.filter();
            }),
        });
        $("#gldate").val(FORMATTEDDATE);

    },
    addOne: function(FoodItem) {
        var view = new FoodItemView({
            model: FoodItem
        });
        this.list.append(view.render().el);
        this.totalCal();
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
            calories: (Math.round($("#calories").val()) * $("#servings").val())

        });
        this.input.val('');
        this.servings.val('');
        this.calories.val('');
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
                $.get("https://api.nutritionix.com/v1_1/search/" + query + "?cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=d1dedcac&appKey=8159f50c871452df6092206f6fdf2d9d",
                    function(data) {
                        $("#autocomplete").html("");
                        if (data.length != 0) {
                            for (var i = 0; i < data.hits.length; i++) {
                                $("#autocomplete").append("<li id=" + i + ">" + (data.hits[i]['fields']['item_name']) + ", by " + (data.hits[i]['fields']['brand_name']) + "</li><br>");
                            }
                            $("#autocomplete").click(function(e) {
                                $("#new-food").val(e.target.innerText);
                                $.get("https://api.nutritionix.com/v1_1/item?id=" + data.hits[e.target.id]["_id"] + "&appId=d1dedcac&appKey=8159f50c871452df6092206f6fdf2d9d",
                                    function(itemData) {
                                        var itemCals = (itemData["nf_calories"]);
                                        $("#calories").val(itemCals);
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
        if (confirm("are you SURE you want to reset the database?")) {
        this.collection.reset();
        this.list.html("");
        this.input.focus();
    } else {return;}
    },

    rerender: function(items) {
        this.list.html("");
        items.each(function(foodItem){
            var newView = new FoodItemView({
                model: foodItem,
                collection: this.collection
            });
            $("#food-list").append(newView.render().el);
        });
        this.totalCal();
        return this;
    },

    filter: function(e){
        var displayDate = $("#gldate").val();
        this.rerender(this.collection.byDate(displayDate));
    },

    totalCal: function() {
            var calTotal = 0;
            $('.DOMcals').each(function() {
                calTotal += parseFloat($(this).text());
            })
                $(".calTotal").text(calTotal);
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
