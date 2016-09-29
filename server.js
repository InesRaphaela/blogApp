var bodyParser 	= require("body-parser");
methodOverride 	= require("method-override");
mongoose 		= require("mongoose"),
express 		= require("express"),
sanitizer		= require("express-sanitizer");
port 			= process.env.PORT || 7070;
app 			= express()

// app configs
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer());
app.set("view engine", 'ejs'); // not ejs extention needed
mongoose.connect("mongodb://localhost/blogs_app");


// mongoose model config
var blogSchema  = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title: "California Life",
// 	image: "https://images.unsplash.com/photo-1474204075013-fafcfee9bfd7?dpr=0.5&auto=compress,format&crop=entropy&fit=crop&w=1199&h=960&q=80&cs=tinysrgb",
// 	body: "This is a blogpost about California"
// });

////////////
// ROUTES //
////////////

// HOME
app.get("/", function(req, res){
	res.redirect("/blogs");
})

// INDEX
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs) {
		if (err){
			console.log("error");
		} else {
			res.render("index", {blogs:blogs});
		}
	})
})

// NEW
app.get("/blog/new", function(req, res) {
	res.render("new");
});


// POST
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   	var formData = req.body.blog;
   	Blog.create(formData, function(err, newBlog){
    	console.log(newBlog);
      	if(err){
        	res.render("new");
      	} else {
        	res.redirect("/blogs");
		}
   });
});

// SHOW
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, blog){
      	if(err){
        	res.redirect("/");
      	} else {
          	res.render("show", {blog: blog});
      	}
   	});
});

// EDIT
app.get("/blogs/:id/edit", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog){
      	if(err){
        	res.redirect("/blogs");
      	} else {
          	res.render("edit", {blog: foundBlog});
      	}
	});
});

// UPDATE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body)
   	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           console.log(err);
       } else {
         var showUrl = "/blogs/" + updatedBlog._id;
         res.redirect(showUrl);
       }
   });
});

// DELETE
app.delete("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, blog){
       if(err){
           console.log(err);
       } else {
           blog.remove();
           res.redirect("/blogs");
       }
   }); 
});


// launch
app.listen(port, function(){
	console.log("Server is running on Port: ", port);
})