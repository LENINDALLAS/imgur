// Step 1 - set up express & mongoose

var express = require('express')                         //importing  express 
var app = express()                                      //In order to use express in the form of variable
var bodyParser = require('body-parser');                 //importing  body parser
var mongoose = require('mongoose')                       //importing mongoose

var fs = require('fs');                                 //importing the path
var path = require('path');                             
require('dotenv/config');                               //importing the confidential file

// Step 2 - connect to the database

mongoose.connect(process.env.MONGO_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true }, err => {    
		console.log('connected')
	});


    
// Step 3 - code was added to ./models.js

// Step 4 - set up EJS

app.use(bodyParser.urlencoded({ extended: false }))             //It is used to encode the url
app.use(bodyParser.json())                                      //It is used to encode the json

// Set EJS as templating engine
app.set("view engine", "ejs");

    // Step 5 - set up multer for storing uploaded files

var multer = require('multer');

var storage = multer.diskStorage({                         //setting the diskstorage
	destination: (req, file, cb) => {
		cb(null, 'uploads')                                //setting the destination to uploads
	},
	filename: (req, file, cb) => {                         //setting the filename to acess it to render on the webpage
		cb(null, file.fieldname )
	}
});

var upload = multer({ storage: storage });                 //setting the storage


// Step 6 - load the mongoose model for Image

var imgModel = require('./model');                                // Require the schema object


// Step 7 - the GET request handler that provides the HTML UI

app.get('/', (req, res) => {                    
	imgModel.find({}, (err, items) => {                                 //Finds all the files and provides it 
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);             //Error is handled 
		}
		else {
			res.render('imagesPage', { items: items });                 //The response is handled by rendering the page 
		}
	});
});


// Step 8 - the POST handler for processing the uploaded file

app.post('/', upload.single('image'), (req, res, next) => {              //Upload the image using single method

    if(!req.body.email) {
        return res.status(400).send({                                    //Validation for email
            message: "email cannot be empty"
        });  
    } else if(req.body.password !== req.body.repassword) {              //Validation for password 
        return res.status(400).send({
            message: "Password does not match"
        })
    }
    
	var obj = {                                                         //obj is created from the input from the HTML body 
		name: req.body.name,
		email: req.body.email,
        password: req.body.password,
		repassword: req.body.repassword,
        likes: req.body.likes,
		comments: req.body.comments,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),     //Accessing the files from uploads folder
			contentType: 'image/png'
		}
	}
	imgModel.create(obj, (err, item) => {                                //Creating a new object as obj
		if (err) {
			console.log(err);                                            //Console the error
		}
		else {
			// item.save();
			res.redirect('/');                                            //Redirects to the same page 
		}
	});
});

app.get('/:noteId' ,(req , res) => {                                      //Get by id 
	imgModel.findById(req.params.noteId)                                  //Specify schema  and find by the id 
	.then(obj => {
		if(!obj) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(obj);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    
	})
})
	
 
 app.put('/:noteId', (req , res) => {                                          // Update a Note with noteId
	                                                                         
	  imgModel.findByIdAndUpdate(req.params.noteId, {                          // Find document and update it with the request body
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        repassword: req.body.repassword,
        image: req.body.image,
        likes: req.body.likes || 1,
        comments: req.body.comments
    }, {new: true})
	.then(obj => {
        if(!obj) {
            return res.status(404).send({
                message: "document not found with id " + req.params.noteId
            });
        }
        res.send(obj);
	}).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "document not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "error updating document with id " + req.params.noteId
        });
    });
 });

  
  app.patch('/:noteId', (req , res) => {                                   //update a particular field in document
     
    let objToUpdate = {};
    if(req.body.name) objToUpdate = { ...objToUpdate, name: req.body.name }
    if(req.body.email) objToUpdate = { ...objToUpdate, email: req.body.email }
    if(req.body.password) objToUpdate = { ...objToUpdate, password: req.body.password }
    if(req.body.repassword) objToUpdate = { ...objToUpdate, repassword: req.body.repassword}
    if(req.body.image) objToUpdate = { ...objToUpdate, image: req.body.image}
    if(req.body.likes) objToUpdate = { ...objToUpdate, likes: req.body.likes || 1}
    if(req.body.comments) objToUpdate = { ...objToUpdate, comments: req.body.comments}
    imgModel.findOneAndUpdate({ _id: req.params.noteId },                  //find one and update method is used
        objToUpdate                                                        //Takes only one file to update

    , {new: true})
	.then(obj => {
		if(!obj) {
			return res.status(404).send({
				message: "document not found with id " + req.params.noteId
			});
		}
		res.send(obj);
	}).catch(err => {
		if(err.kind === 'ObjectId') {
			return res.status(404).send({
				message: "error document not found with id " + req.params.noteId
			});                
		}
		return res.status(500).send({
			message: "Error updating document with id " + req.params.noteId
		});
	});
  })

 
 app.delete('/:noteId', (req , res) => {                                // Delete a Note with noteId
	imgModel.findByIdAndRemove(req.params.noteId)                       //Removing a document by id specified
	.then(obj => {
        if(!obj) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
 });



var port = process.env.PORT || '2000'                                         // Step 9 - configure the server's port

app.listen(port, err => {                                                     //Setting express  to listen to port
	if (err)
		throw err
	console.log('Server listening on port', port)
})
