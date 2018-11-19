var express     = require("express"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose    = require("mongoose"),
    bodyParser  = require("body-parser"),
    app         = express();
    
//connecting to the db
mongoose.connect("mongodb://localhost:27017/rest_blog", {useNewUrlParser: true}); 
//config
app.set("view engine", "ejs");
//body parser config
app.use(bodyParser.urlencoded({extended: true}));
//sanitize
app.use(expressSanitizer());
//serve static files
app.use(express.static('public'));
//method override for put requests
app.use(methodOverride("_method"));


//mongoose/Model configuration
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created:  {type: Date, default: Date.now() }
    });
var Blog = mongoose.model("Blog", blogSchema);

//RESTful routes
//index
app.get("/", function(req, res){
    res.redirect("/blogs");
});

//get all blogs
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Something went wrong : ");
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//new route
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//create route
app.post("/blogs", function(req, res){
    //sanitize
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, blog){
        if(err){
            console.log("Error : "+err);
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    })
});

//show route
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: blog});
        }
    });
});

//edit route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//update route (viewless)
app.put("/blogs/:id", function(req, res){
    //sanitize
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs/"+req.params.id);
       }
    });
   
});

//delete route (viewless)
app.delete("/blogs/:id", function(req, res){
   Blog.findByIdAndDelete(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       } else {
           res.redirect("/blogs");
       }
   });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Blog is up!");
});


//db dummies
/*
Blog.create({
    title: "My first blog",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHBJcXFV_sizfrnfgF1zl1EuspulY99pPbolHpzZSBBb76_tlWZA",
    body: "Is it normal ? The power of the brain over the body. Is it all an illusion? Or is it the things that we trap inside of us for so many years bursting out at once?"
});
*/