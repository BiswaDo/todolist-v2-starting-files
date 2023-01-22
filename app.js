

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);

mongoose.connect("mongodb+srv://Dodo:9933023110Dodo@cluster0.vs1sucr.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true} , (err)=>{

  if(err){
    console.log(err);
  }else{
    console.log("successfully connected");
  }

});

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Welcome to your todolist! 2nd"
});

const item3 = new Item({
  name:"Welcome to your todolist! 3rd"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("done!");
        }
      });
      res.redirect("/");
    }else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.get("/:customListName", function(req,res){
  const customListName = req.params.customListName;
  const capitalizedListName = _.capitalize(customListName);
  List.findOne({name:capitalizedListName},function(err,result){
    if(!err){
      if(!result){

        const list = new List({
          name: capitalizedListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+capitalizedListName);
      }else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){

    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req,res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemId, function(err){
      if(!err){
        console.log("deletion done!");
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
