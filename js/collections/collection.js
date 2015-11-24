"use strict";
// define app as an empty object if it isn't already defined
var app = app || {};

// our archetypal collection. Back End is Firebased (heh).
var FoodCollection = Backbone.Firebase.Collection.extend({
    model: FoodItem,
    url: "https://glaring-fire-8181.firebaseio.com/",

    // byDate is a helper function that returns only those items
    // in the database whose date field corresponds to the function's arg.
    // (see views.js for how it's used)
    byDate: function(date) {
        return _(this.filter(function(foodItem) {
            return foodItem.get("date") === date;
        }));
    }
});

//init an instance of our collection for fun and profit.
var foodCollection = new FoodCollection();
