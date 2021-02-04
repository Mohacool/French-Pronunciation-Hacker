// 'use strict';
if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express'); // const path = require('path');
const bodyParser = require('body-parser');

const environmentVars = require('dotenv').config();


// var secure = require('express-force-https');

// Google Cloud
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient(); // Creates a client

const app = express();
// app.use(secure);
const port = process.env.PORT || 1337;

const server = require('http').createServer(app);

const io = require('socket.io')(server);

app.use('/assets', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// ==============  OLD Database Connection ==================
// const mongoose = require('mongoose')
// mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true})
// const db = mongoose.connection
// db.on('error',error => console.error(error))
// db.once('open',() => console.log('Connected to Mongoose'))

// New connection database
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Node mailer
const nodemailer = require("nodemailer");

const ObjectId = require('mongodb').ObjectId;

const jwt_secret = process.env.JWT_SECRET
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.urlencoded({ extended: false}))




mongoose.connect(process.env.MONGO_DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

// Change password
app.post('/api/change-password', async (req,res) =>{
  const { token, newpassword: plainTextPassword } = req.body

  
  if (!plainTextPassword || typeof plainTextPassword !== 'string'){
      return res.json ({ status: 'error', error: 'Invalid password'})
  }
  if (plainTextPassword.length <5){
      return res.json ({ 
        status: 'error', 
        error: 'Password too small. Should be atleast 6 characters'
      })
  }
  try {
      const user = jwt.verify(token, jwt_secret)
      console.log('JWT decoded', user)

      const _id = user.id
      const password = await bcrypt.hash(plainTextPassword)

      // Update the entry in the databse
      await User.updateOne( { _id}, {$set: {password}})

      res.json({status:'ok'})

  } catch(error){
      res.json({status:'error', error:';'})
  }
  
})

// Login user
app.post('/api/login', async (req,res) => {

    const { email, password } = req.body

    // lean returns simpler version of json
    const user = await User.findOne( {email}).lean()

    if (!user){
        return res.json ({ status:'error', error: 'Invalid username/password'})
    }

    if ( await bcrypt.compare(password, user.password)){
        // email, password combination is succesful
        const token = jwt.sign({
          id: user._id, 
          email: user.email,
          name: user.name
        }, jwt_secret)

        return res.json ({ status:'ok', data: token, user})
    }

    res.json({ status: 'error', error: 'Invalid username/password'})
})

// ================  REGISTER USER
app.post('/api/register', async (req,res) =>{

    console.log('starting register')
    // User.find, User.delete 

    // You need to hash the passwords
    const { name, password: plainTextPassword, email, password2 } = req.body

    if (!name || typeof name !== 'string'){
        return res.json ({ status: 'error', error: 'Invalid name'})
    }
    if (!plainTextPassword || typeof plainTextPassword !== 'string'){
        return res.json ({ status: 'error', error: 'Invalid password'})
    }
    if (!email){
      return res.json ({status: 'error', error:'You must provide an email'})
    }
    if (plainTextPassword.length <5){
        return res.json ({ 
          status: 'error', 
          error: 'Password too small. Should be atleast 6 characters'
        })
    }
    if (plainTextPassword !== password2){
      return res.json ({ 
        status: 'error', 
        error: 'Passwords dont match'
      })
    }
    // Check if email is in form blahblah@xxxxxx.com (maybe regex?)

    const password = await bcrypt.hash(plainTextPassword,10)

    console.log(req.body)

    try {

      // Create User

      const response = await User.create({
        name,
        password,
        email
      })

      console.log('User created succesfully: ', response)


      // Send welcome email

      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: "mi3-ts5.a2hosting.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'french@pronunciationhacker.a2hosted.com', 
          pass: process.env.SERVER_PASSWORD
        },
        // put this back in for LOCAL TESTING
        // tls:{
        //   rejectUnauthorized:false
        // }
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: 'french@pronunciationhacker.a2hosted.com', // sender address
        to: "moha.salama@mail.utoronto.ca", // list of receivers
        subject: `French Pronunciation Hacker Welcome ${name}!`, // Subject line
        text: `Welcome ${name}!`, // plain text body
        html: // html body
          ` <img src="cid:image_header"/><br>
          Bienvenue ${name} &#x1F60A; &#128075; et bravo pour ton ambition d'apprendre le français ! <br><br>
          Continue ! C'est une question de temps, de concentration et de pratiquer avec des ressources adaptées ! <br><br>
          Notre objectif est de t'aider à progresser rapidement en français. Alors, n'hésite pas à envoyer ton commentaire ou ta recommandation pour améliorer le site internet. <br><br>
          Pour apprendre rapidement le français, c'est bien de fixer un objectif en minutes pour pratiquer chaque jour, par exemple 15 minutes ! <br><br>
          À bientôt !<br>
          Moha et Fred`, 

        attachments: [{
          filename: 'image_header.png',
          path: 'https://res.cloudinary.com/mohacool/image/upload/v1612404266/email_header_mrige7.png',
          cid: 'image_header' //same cid value as in the html img src
      }]
      });

      // console.log("Message sent: %s", info.messageId);

      // res.redirect('/login')

    } catch(error){
        console.log(error);
        if (error.code === 11000){
          // Duplicate key
          return res.json ({status:'error', error: 'Email already in use'})
        }
        return res.json ({status:'error', error: 'error general'})
        // throw error
    }
    res.json({status:'ok'})

    

    

})

// ================  Update USER PROGRESS
app.post('/api/update_progress', async (req,res) =>{

	const { token, words_complete, skip_indices} = req.body
	try {
		const user = jwt.verify(token, jwt_secret)
		console.log('JWT decoded', user)
  
		const _id = user.id

		// console.log('words completed'+words_complete)

		// Update the entries in the databse
		await User.updateOne( { _id}, {$set: {'current_spot':words_complete}})
		await User.updateOne( { _id}, {$set: {'skipped':skip_indices}})
  
		res.json({status:'ok'})
  
	} catch(error){
		res.json({status:'error', error:';'})
	}

	console.log("Starting update_progress")
	// console.log(req.body)

})

app.post('/api/get_progress', async (req,res) =>{
	const { token } = req.body

	const user = jwt.verify(token, jwt_secret)
	console.log('JWT decoded', user)
	const _id = user.id

	try{

		// Get the row in DB for the user
		const user_row = await User.find({"_id" : ObjectId(_id)})
		
		res.json({status:'ok',user_row:user_row})


	} catch(error){
		res.json({status:'error', error:';'})
	}
	

})




// =========================== ROUTERS ================================ //

app.get('/', function (req, res) {
  res.render('index');
});

app.use('/', function (req, res, next) {
  next(); // console.log(`Request Url: ${req.url}`);
});


app.get('/login/', function (req, res) {
  res.render('login', {});
});

app.get('/landing/', function (req, res) {
	res.render('landing', {});
  });


app.get('/register/', function (req, res) {
  res.render('register', {});
});


app.get('/change-password/', function (req, res) {
  res.render('change-password', {});
});



// MY NEW ROUTE for a new page
app.get('/buythebook/', function (req, res) {
  res.render('buythebook', {});
});






// =========================== SOCKET.IO ================================ //

io.on('connection', function (client) {
  console.log('Client Connected to server');
  let recognizeStream = null;

  client.on('join', function () {
    client.emit('messages', 'Socket Connected to Server');
  });

  client.on('messages', function (data) {
    client.emit('broad', data);
  });

  client.on('startGoogleCloudStream', function (data) {
    startRecognitionStream(this, data);
  });

  client.on('endGoogleCloudStream', function () {
    stopRecognitionStream();
  });

  client.on('binaryData', function (data) {
    // console.log(data); //log binary data
    if (recognizeStream !== null) {
      recognizeStream.write(data);
    }
  });

  function startRecognitionStream(client) {
    recognizeStream = speechClient
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', (data) => {
        process.stdout.write(data.results[0] && data.results[0].alternatives[0] ? `Transcription: ${data.results[0].alternatives[0].transcript}\n` : '\n\nReached transcription time limit, press Ctrl+C\n');
        client.emit('speechData', data);

        // if end of utterance, let's restart stream
        // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
        if (data.results[0] && data.results[0].isFinal) {
          stopRecognitionStream();
          startRecognitionStream(client);
          // console.log('restarted stream serverside');
        }
      });
  }

  function stopRecognitionStream() {
    if (recognizeStream) {
      recognizeStream.end();
    }
    recognizeStream = null;
  }
});

// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
// const languageCode = 'en-US'; 
const languageCode = 'fr-FR';

const request = {
  config: {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
    profanityFilter: false,
    enableWordTimeOffsets: true,
    // speechContexts: [{
    //     phrases: ["hoful","shwazil"]
    //    }] // add your own speech context for better recognition
  },
  interimResults: true, // If you want interim results, set this to true
};

// =========================== START SERVER ================================ //

// server.listen(port, '127.0.0.1', function () {
//   //http listen, to make socket work
//   // app.address = "127.0.0.1";
//   console.log('Server started on port:' + port);
// });

server.listen(port, () => {
  console.log(`Our app is running on port ${ port }`);
});