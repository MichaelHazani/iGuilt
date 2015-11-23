var app = app || {};

var FoodCollection = Backbone.Firebase.Collection.extend({
    model: FoodItem,
    url: "https://glaring-fire-8181.firebaseio.com/",

    byDate: function(date) {
        return _(this.filter(function(foodItem) {
            return foodItem.get("date") === date;
        }));
    }
});

var foodCollection = new FoodCollection();
var thisCol = foodCollection.byDate("11/21/15");
