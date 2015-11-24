"use strict";

// define app as an empty object if it isn't already defined
var app = app || {};

// A standard Backbone model. Nothing to write home about. Food defaults to a
// "new food" string for debugging purposes.
var FoodItem = Backbone.Model.extend({
    defaults: {
        date: 0,
        food: "new food",
        servings: 0,
        calories: 0
    }
});


