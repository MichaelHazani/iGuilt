//'use strict' here breaks the app!
//define app as an empty object if it isn't already defined
var app = app || {};

//current date and formatted current date are constants, or at the very least (harmlessly) global vars,
//so they get all caps per the known convention.
var DATE = new Date();
var FORMATTEDDATE = (DATE.getMonth() + 1 + "/" + DATE.getDate() + "/" + DATE.getFullYear());

//individual item view
var FoodItemView = Backbone.View.extend({
    //the tag to be created for each item
    tagName: "li",

    //run destroy function when .libut button is pressed
    events: {
        "click button.libut": "destroy"
    },


    //not modifying the view's "initialize" function or adding listenTo events here - "destroy" lived here but
    //I needed the DOM removal to happen before the destroy message so that AppView's totalCal can query the DOM properly.
    //For more information see:
    //https://discussions.udacity.com/t/avoiding-dry-in-backbone-views-and-methods-or-my-clunky-solution-and-me/39196/4
    destroy: function() {
        //remove item from DOM first!
        this.remove();
        //then remove it from the collection
        this.model.destroy();
        //bright and ready for a new item
        $("#new-food").focus();
    },
    render: function() {

        //even though we have a dedicated filtering function (see collection.js),
        //I need this condition for the initial filtering of the items - only those with today's date.
        if (this.model.get('date') == $(".gldate").val()) {
            //I avoided underscore's template because, honestly, I had my hands full with Backbone.
            //this is NOT an easy project!;)
            //it seems really easy and I'll get around to it soon.

            //so let's start with our delete button
            this.$el.html("<button id='destroy' class='libut'></button>    " +
                //query the model's "servings" attribute and the model's "food" attribute
                this.model.get('servings') + " servings of " + this.model.get('food') +
                //put the cals in a container of their own for formatting purposes
                //and isolate the actual cal number div for later sum calculations
                "<span class='calContainer  pull-right'><span class='DOMcals'>" +
                //now get them calories!
                this.model.get('calories') + "</span> calories  " + "</span><br>");
        }
        //CRUCIAL! Breaks without a return, damnit.
        return this;
    },
});


//global all-item view. Let's DO this!
var AppView = Backbone.View.extend({
    //our DOM element
    el: $('#foodapp'),
    //getting the collection from collection.js (already instantiated)
    collection: foodCollection,
    events: {
        //"Add" button creates a new item
        "click button#add-food": "createFood",
        //"reset Database" button checks you're sure, then does the unforgiveable
        "click button#reset": "reset",
        //autocomplete magic on every key!
        "keyup #new-food": "autoComplete",
    },

    initialize: function() {
        // "that"'s necessary for our date-picking logic to work (see below)
        var that = this;
        this.list = $("#food-list");
        this.input = $("#new-food");
        this.servings = $("#servings");
        this.calories = $("#calories");
        this.glDate = $(".gldate");
        this.input.focus();

        //re-calc the total amount of calories on sync (like when we open the page)
        this.listenTo(this.collection, 'sync', this.totalCal);
        //handle DOM logic when we create an item
        this.listenTo(this.collection, 'add', this.addOne);
        //re-calc the total amount of calories when item is removed
        this.listenTo(this.collection, 'remove', this.totalCal);

        //easy-peasy jQuery date widget
        //(I tried to implement a Bootstrap specific one but they're riddled with bugs!)
        $(".gldate").glDatePicker({
            //upon instantiation, let's tell it that:
            onClick: (function(el, cell, date, data) {
                //give me the chosen date
                el.val(date.toLocaleDateString());
                //and filter that day's items into a new view!
                that.filter();
            }),
        });
        //now let's start it off with today's date.
        $(".gldate").val(FORMATTEDDATE);

    },

    addOne: function(FoodItem) {
        //when a model is created,
        //update DOM with it
        var view = new FoodItemView({
            model: FoodItem
        });
        //append the item's DOM element
        //to our list
        this.list.append(view.render().el);
        //re-sum the day's calories
        this.totalCal();
    },

    //this is the main Backbone-side item creation logic
    createFood: function() {
        //field validation
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

        //init our input fields
        this.input.val('');
        this.servings.val('');
        this.calories.val('');
    },

    //okay, ready for this? Fun times ahead.
    autoComplete: function(e) {
        //return key will act like it, damnit
        if (e.keyCode === 13) {
            this.createFood();
        } else if (e.keyCode === 27) {
            //esc key will effectively close the autocomplete window
            $("#autocomplete").html("");
        } else {
            //if we have any input
            if (this.input.val()) {
                // format our input and send off an API request to the good folks at Nutritionix!
                var query = (this.input.val()).replace(" ", "%20");
                $.get("https://api.nutritionix.com/v1_1/search/" + query + "?cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=8b44227f&appKey=979a61790b4e55a8d4bc92c954038963",
                    function(data) {
                        //on callback, init our autocomplete window
                        $("#autocomplete").html("");
                        //if we got anything back
                        if (data.length !== 0) {
                            //append the item name to our autocomplete window, in a list
                            for (var i = 0; i < data.hits.length; i++) {
                                $("#autocomplete").append("<li id=" + i + ">" + (data.hits[i].fields.item_name) + ", by " + (data.hits[i].fields.brand_name) + "</li><br>");
                            }
                            //and when that item is clicked
                            $("#autocomplete").click(function(e) {
                                //fill the input field with that item's name
                                $("#new-food").val(e.target.innerText);
                                //and get its respective calories with another call using its unique Nutritionix item id
                                $.get("https://api.nutritionix.com/v1_1/item?id=" + data.hits[e.target.id]._id + "&appId=8b44227f&appKey=979a61790b4e55a8d4bc92c954038963",
                                    function(itemData) {
                                        //put them in our readymade container
                                        var itemCals = (itemData["nf_calories"]);
                                        $("#calories").val(itemCals);
                                        //on failure (damnit!)
                                    }).fail(function() {
                                    //apologize nicely.
                                    $("#calories").val("No Calories Retrieved; please enter manually");
                                });
                                //after all the hubbub of item selection, "close window" (empty list; css will tell it to make itself scarce
                                $("#autocomplete").html("");
                            });
                        }
                        //if you can't fetch anything for any reason
                    }).fail(function() {
                    //sometimes it's better to say nothing at all.
                    $("#autocomplete").html("");
                });
            } else {
                //no input, no output!
                $("#autocomplete").html("");
            }
        }
    },
    //only a MADMAN would...
    reset: function() {
        //double check your sanity
        if (confirm("are you SURE you want to reset the database?")) {

            this.collection.reset();
            //clear list
            //this can probably now hitch a ride on "filter()"
            //honestly I'm too afraid to mess with the DB to try and implement it
            //now that I've put dozens of fictitious items in it and used up 3 different API keys
            this.list.html("");
            this.input.focus();
        } else {
            //come back to the sane world
            return;
        }
    },

    //this how we filter items!
    filter: function(e) {
        //we don't do anything, really, except grab the requested date
        var displayDate = $(".gldate").val();
        //and run our byDate filtering function in collection.js, then re-render it!
        this.rerender(this.collection.byDate(displayDate));
    },

    //which brings us to...
    // a nifty helper function to help with re-rendering filtered items. Take our filtered items and:
    rerender: function(items) {
        //empty list
        $("#food-list").html("");
        //for each of those filtered items
        items.each(function(foodItem) {
            //give it a new view
            var newView = new FoodItemView({
                model: foodItem,
                collection: this.collection
            });
            //and append that item like we did before
            $("#food-list").append(newView.render().el);
        });
        //run our old friend, the calorie-summing function
        this.totalCal();
        //ugh. Just. Don't. Forget:)
        return this;
    },

    // at this point in the code it's a pretty infamous function.
    totalCal: function() {
        var calTotal = 0;
        //query all our current items' DOM elements -
        //(that's how we only get whatever day's items and not the whole shebang)
        $('.DOMcals').each(function() {
            //clean them up good and add them up
            calTotal += parseFloat($(this).text());
        });
        //update the total sum's date field
        $(".todaysDate").text($(".gldate").val());
        //and its actual number
        $(".calTotal").text(calTotal);
    }
});

//Init App!
function init() {

    //let's rock and roll! Init our main view!
    var app = new AppView();



}

//WHEW. When doc is ready (check using jQuery), init!
$(function() {
    init();
});
