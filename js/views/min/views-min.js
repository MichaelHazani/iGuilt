function init(){var e=new AppView}var DATE=new Date,FORMATTEDDATE=DATE.getMonth()+1+"/"+DATE.getDate()+"/"+DATE.getFullYear(),FoodItemView=Backbone.View.extend({tagName:"li",events:{"click button#destroy":"destroy"},initialize:function(){this.listenTo(this.model,"change",this.render),this.listenTo(this.model,"destroy",this.remove)},destroy:function(){this.model.destroy(),$("#new-food").focus()},render:function(){return this.model.get("date")==$("#gldate").val()&&this.$el.html(this.model.get("date")+" "+this.model.get("servings")+" servings of "+this.model.get("food")+": "+this.model.get("calories")+" calories<button id='destroy' class='libut pull-right'>Delete</button><br>"),this},test:function(){console.log("hi")}}),AppView=Backbone.View.extend({el:$("#foodapp"),collection:new FoodCollection,events:{"click button#add-food":"createFood","click button#reset":"reset","keyup #new-food":"autoComplete"},initialize:function(){var e=this;this.list=$("#food-list"),this.input=$("#new-food"),this.servings=$("#servings"),this.glDate=$(".gldate"),this.input.focus(),this.listenTo(this.collection,"add",this.addOne),$("#gldate").glDatePicker({onClick:function(e,t,i,o){e.val(i.toLocaleDateString())}}),$("#gldate").val(FORMATTEDDATE)},addOne:function(e){var t=new FoodItemView({model:e});this.list.append(t.render().el)},addAll:function(){this.collection.each(this.addOne,this)},createFood:function(){return this.input.val()&&this.servings.val()?(this.collection.create({date:this.glDate.val(),food:this.input.val(),servings:$("#servings").val(),calories:$("#calories").val()*$("#servings").val()}),void this.input.val("")):void alert("please enter all required fields")},createOnEnter:function(e){13==e.keyCode&&this.createFood()},autoComplete:function(e){if(13===e.keyCode)this.createFood();else if(this.input.val()){var t=this.input.val().replace(" ","%20");$.get("https://api.nutritionix.com/v1_1/search/"+t+"?cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=d1dedcac&appKey=8159f50c871452df6092206f6fdf2d9d",function(e){if($("#autocomplete").html(""),0!=e.length){for(var t=0;t<e.hits.length;t++)$("#autocomplete").append("<li id="+t+">"+e.hits[t].fields.item_name+", by "+e.hits[t].fields.brand_name+"</li><br>");$("#autocomplete").click(function(t){$("#new-food").val(t.target.innerText),$.get("https://api.nutritionix.com/v1_1/item?id="+e.hits[t.target.id]._id+"&appId=d1dedcac&appKey=8159f50c871452df6092206f6fdf2d9d",function(e){var t=e.nf_calories;$("#calories").val(t)}),$("#autocomplete").html("")})}}).fail(function(){$("#autocomplete").html("")})}else $("#autocomplete").html("")},reset:function(){this.collection.reset(),this.list.html(""),this.input.focus()},render:function(){this.collection.each(function(e){e.render()})}});$(function(){init()});