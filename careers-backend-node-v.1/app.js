var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var axios = require('axios');
const AWS = require('aws-sdk');

var mongoose = require('mongoose');
const database_url = process.env.DATABASE_URI;

var authRouter = require('./routes/authRouter');
var indexRouter = require('./routes/index');
var servicesRouter = require('./routes/servicesRouter');
var stepspathRouter = require('./routes/stepsRouter');
var usersRouter = require('./routes/usersRouter');
var universitiesRouter = require('./routes/universitiesRouter');
var pathsRouter = require('./routes/pathRouter')
var userpathRouter = require('./routes/userpathRouter')
var cors = require("cors");
const preLoginRouter = require('./routes/preLoginRouter');
var userPersonalityRouter = require('./routes/userPersonalityRouter')
var partnerRouter = require('./routes/partnerRouter')
var adminRouter = require('./routes/adminRouter')
var personalityRouter = require('./routes/personalityRouter')
var programRouter = require('./routes/programRouter')
// var usersRouter = require('./routes/users');

var app = express();

AWS.config.update({ region: 'ap-south-1' });
const s3 = new AWS.S3();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// set the body parser to handle urlencoded data
app.use(bodyParser.json());
app.use('/api/services', servicesRouter);
app.use('/api/steps', stepspathRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/universities', universitiesRouter)
app.use('/api/paths', pathsRouter)
app.use('/api/fetch', userpathRouter)
app.use('/api/pre_login', preLoginRouter)
app.use('/api/userAnswers', userPersonalityRouter)
app.use('/api/partner', partnerRouter)
app.use('/api/admin', adminRouter)
app.use('/api/personality', personalityRouter)
app.use('/api/userpaths', programRouter)


app.post('/api/get-presigned-url', async (req, res) => {
  const params = {
    Bucket: 'naaviprofileuploads',
    Key: req.body.fileName,
    ContentType: req.body.fileType,
    ACL: "public-read",
  };

  try {
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    res.json({ presignedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});



//Increase body size limit to 50mb to prevent error: request entity too large(413)
app.use(express.urlencoded({
  limit: '50mb',
  extended: true
}));

// set the body parser to handle json data
// app.use(bodyParser.json({
//   limit: '10mb' // set the limit to 10 megabytes
// }));
// console.log("inside server")
app.use(express.json({ limit: '50mb' }));

app.get('/api/places', async (req, res) => {
  const apiKey = 'AIzaSyB5MJ2jMHzl_ghkbxOsyPmeBmYw_sUsIRQ';
  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.query.place_id}&key=${apiKey}`;

  try {
    const apiResponse = await axios.get(apiUrl);
    const data = apiResponse.data;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});














// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Mongodb conncetion with the database_uri
// mongoose.set('useCreateIndex', true)
mongoose.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to the Database');
});

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
