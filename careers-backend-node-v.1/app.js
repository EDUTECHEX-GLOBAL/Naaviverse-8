var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var axios = require('axios');

var mongoose = require('mongoose');
const database_url = process.env.DATABASE_URI;

var authRouter = require('./routes/authRouter');
var indexRouter = require('./routes/index');
var servicesRouter = require('./routes/servicesRouter');
var stepspathRouter = require('./routes/stepsRouter');
var usersRouter = require('./routes/usersRouter');
var universitiesRouter = require('./routes/universitiesRouter');
var pathsRouter = require('./routes/pathRouter');
var userpathRouter = require('./routes/userpathRouter');
var cors = require("cors");
const preLoginRouter = require('./routes/preLoginRouter');
var userPersonalityRouter = require('./routes/userPersonalityRouter');
var partnerRouter = require('./routes/partnerRouter');
var adminRouter = require('./routes/adminRouter');
var personalityRouter = require('./routes/personalityRouter');
var programRouter = require('./routes/programRouter');
var app = express();

// AWS SDK Setup
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/services', servicesRouter);
app.use('/api/steps', stepspathRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/paths', pathsRouter);
app.use('/api/fetch', userpathRouter);
app.use('/api/pre_login', preLoginRouter);
app.use('/api/userAnswers', userPersonalityRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/personality', personalityRouter);
app.use('/api/userpaths', programRouter);

// Increase body size limit to 50mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose.connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to the Database');
});

// New route for file upload to S3
app.post('/api/upload', (req, res) => {
  const { file } = req.files; // Assuming you are using `express-fileupload` middleware
  const params = {
    Bucket: 'naaviprofileuploads', // Your S3 Bucket name
    Key: `profile_pics/${Date.now()}_${file.name}`, // Set the path/filename in S3
    Body: file.data,
    ContentType: file.mimetype,
    ACL: 'private', // Private access
  };

  s3.upload(params, (error, data) => {
    if (error) {
      console.error('Error uploading file:', error);
      return res.status(500).send({ error: 'Failed to upload image' });
    }
    console.log('File uploaded successfully:', data);
    // Return the URL of the uploaded file
    res.status(200).send({ url: data.Location });
  });
});

app.post("/api/upload-profile-pic", async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "File name and type are required" });
    }

    const timestamp = Date.now();
    const key = `partner-profile-pics/${timestamp}-${fileName}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: "private",
    };

    // Generate a signed URL for direct upload from frontend
    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    res.json({ uploadUrl, fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}` });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
