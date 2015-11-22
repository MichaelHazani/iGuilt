var FoodCollection = Backbone.Firebase.Collection.extend({
    model: FoodItem,
    url: "https://glaring-fire-8181.firebaseio.com/",
    // byDay: function(date) {
    //     filtered = this.filter(function(foodItem) {
    //         return foodItem.get("date") == date;
    //     });
    // }
});
