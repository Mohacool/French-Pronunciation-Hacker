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

const jwt_secret = process.env.JWT_SECRET
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



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

      await User.updateOne( 
        { _id}, 
        {
          $set: {password}

        }
      )
      res.json({status:'ok'})

  } catch(error){
      res.json({status:'error', error:';'})
  }
  
})

// Login user
app.post('/api/login', async (req,res) => {

    const { username, password } = req.body

    // lean returns simpler version of json
    const user = await User.findOne( {username}).lean()

    if (!user){
        return res.json ({ status:'error', error: 'Invalid username/password'})
    }

    if ( await bcrypt.compare(password, user.password)){
        // username, password combination is succesful
        const token = jwt.sign({
          id: user._id, 
          username: user.username
        }, jwt_secret)

        return res.json ({ status:'ok', data: token})
    }

    res.json({ status: 'error', error: 'Invalid username/password'})
})

// ================  REGISTER USER

app.post('/api/register', async (req,res) =>{

    console.log('starting register')
    // User.find, User.delete 

    // You need to hash the passwords
    const { username, password: plainTextPassword } = req.body

    if (!username || typeof username !== 'string'){
        return res.json ({ status: 'error', error: 'Invalid username'})
    }
    if (!plainTextPassword || typeof plainTextPassword !== 'string'){
        return res.json ({ status: 'error', error: 'Invalid password'})
    }
    if (plainTextPassword.length <5){
        return res.json ({ 
          status: 'error', 
          error: 'Password too small. Should be atleast 6 characters'
        })
    }

    const password = await bcrypt.hash(plainTextPassword,10)

    console.log(req.body)

    try {

      const response = await User.create({
        username,
        password
      })

      console.log('User created succesfully: ', response)

    } catch(error){
        if (error.code === 11000){
          // Duplicate key
          return res.json ({status:'error', error: 'Username already in use'})
        }
        return res.json ({status:'error', error: 'error general'})
        // throw error
    }

    res.json({status:'ok'})


})


app.use(express.urlencoded({ extended: false}))



// =========================== ROUTERS ================================ //

app.get('/', function (req, res) {
  res.render('index', {name: 'Kyle'});
});

app.use('/', function (req, res, next) {
  next(); // console.log(`Request Url: ${req.url}`);
});


app.get('/login/', function (req, res) {
  res.render('login', {});
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