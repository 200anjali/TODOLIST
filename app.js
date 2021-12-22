const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin--anjali:%23MemeJ%21%212@cluster0.rsssi.mongodb.net/todoListDB");


// mongoose.connect("mongodb://localhost:27017/todoListDB");


const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to your todolist"
});
const item2=new Item({
  name:"hit the + to add a new item"
});
const item3=new Item({
  name:"<-- hit this to delete a new item"
});


const defaultItems=[item1,item2,item3];

const listsSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listsSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length==0)
    {
       Item.insertMany(defaultItems,function(err)
        {
           if(err)
             console.log(err);
           else
             console.log("anjali");
        });
        res.redirect("/");
    }
    else
    {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});


app.post("/", function(req, res){

 const listName=req.body.button;

 const item=new Item({
   name: req.body.newI
 });
 if(listName=="Today")
 {
  item.save();
  res.redirect("/");
 }
 else
 {
   List.findOne({name:listName},function(err,foundList){
     if(!err)
     {
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
     }
   });
 }
 
});

app.post("/delete",function(req,res){
  const todelete=req.body.toBeDeleted;
  const listName=req.body.listName;

  if(listName=="Today")
  {
    Item.findByIdAndRemove(todelete,function(err)
    {
      if(err)
      console.log(err);
      else
      console.log("success");
    });
    res.redirect("/");
  }
  else
  {
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:todelete}}},function(err,foundList){
       if(!err)
       {
         res.redirect("/"+listName);
       }
     });
  }
});


app.get("/:customListName",function(req,res){
 const customListName=_.capitalize(req.params.customListName);
 List.findOne({name:customListName},function(err,foundList){
   if(err)
   {
     console.log(err);
   }
   else
   {
    if(foundList)
    {
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    else
    {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
   }
 });

});

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
