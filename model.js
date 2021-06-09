// Step 3 - this is the code for ./models.js

var mongoose = require('mongoose');                              //required  mongoose to set schema

var imageSchema = new mongoose.Schema({                          //declaring a new schema
	name: {
        type: String,
        required: true                                          //cannot skip this field
    },
    email: {
        type: String,
        unique: true                                            //The value has to be unique 
    },
    password: {
        type: Number,
        min: 5,                                                //minimum value is specified
        required: true           
    },
    repassword: {
        type: Number,
        min: 5,
        required: true
    }, 
    likes: {
        type: Number                                           //The type is set to number 
    },
    comments: {
        type: String,
        min: [2 ,"comments cannot be empty"]                   //If min is not met shows a error
    },
	img:
	{
		data: Buffer,                                          //Image property set to buffer for uploading files
		contentType: String
	}
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Image', imageSchema);

