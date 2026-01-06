/**
 * ============================
 *   🌍 NAAVIVERSE BACKEND
 *   Express Application Setup
 * ============================
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var axios = require('axios');
const AWS = require('aws-sdk');
var cors = require('cors');
var mongoose = require('mongoose');

const app = express();

/* ------------------- AWS CONFIG ------------------- */
AWS.config.update({ region: 'ap-south-1' });
const s3 = new AWS.S3();

/* ------------------- ROUTER IMPORTS ------------------- */
var indexRouter = require('./routes/index');
var authRouter = require('./routes/authRouter');
var servicesRouter = require('./routes/servicesRouter');
var stepspathRouter = require('./routes/stepsRouter');
var usersRouter = require('./routes/usersRouter');
var universitiesRouter = require('./routes/universitiesRouter');
var pathsRouter = require('./routes/pathRouter');
var userpathRouter = require('./routes/userpathRouter');
var preLoginRouter = require('./routes/preLoginRouter');
var userPersonalityRouter = require('./routes/userPersonalityRouter');
var partnerRouter = require('./routes/partnerRouter');
var adminRouter = require('./routes/adminRouter');
var personalityRouter = require('./routes/personalityRouter');
var programRouter = require('./routes/programRouter');



/* ------------------- APP SETUP ------------------- */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* Handle large payloads (file uploads / JSON bodies) */
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));



/* ------------------- DATABASE CONNECTION ------------------- */
const database_url = process.env.DATABASE_URI;

mongoose
  .connect(database_url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));


/* ------------------- CORS CONFIG ------------------- */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

const currencyRoutes = require("./routes/currency.route");
app.use("/api", currencyRoutes);


const countryRoutes = require('./routes/countryRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');


const stepsRouter = require("./routes/steps.routes");
app.use("/steps", stepsRouter);


const stepViewsRoute = require("./routes/stepviews.route");
app.use("/api/stepviews", stepViewsRoute);



/* ------------------- NO-CACHE FOR USER APIs ------------------- */
app.use('/api/users', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});





/* ------------------- API ROUTES ------------------- */
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/steps', stepspathRouter);
app.use('/api/universities', universitiesRouter);
app.use("/api/perplexity", require("./routes/perplexity.route"));
app.use("/api/regenerate", require("./routes/regenerateAll.route"));
app.use("/api/crm", require("./routes/crmRoutes"));
app.use('/api/paths', pathsRouter);
 app.use('/api/fetch', userpathRouter);
app.use('/api/pre_login', preLoginRouter);
app.use('/api/userAnswers', userPersonalityRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/personality', personalityRouter);
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api", require("./routes/checkFormatted"));
app.use("/api/regenerate", require("./routes/regenerateBatch.route"));
app.use("/api/utils", require("./routes/addStepIds.route"));
app.use("/api/stepviews", require("./routes/stepviews.route"));
app.use("/api/vault", require("./routes/vaultRouter"));
app.use("/api/categories", require("./routes/categoriesRouter"));



// THIS IS ONLY FOR THE TEMPORARY ADMIN 
app.use("/admin/universities", require("./routes/adminUniversitiesRouter"));
app.use("/admin/programs", require("./routes/adminProgramsRouter"));
app.use("/admin/steps", require("./routes/adminStepsRouter"));
app.use("/admin/services", require("./routes/adminServicesRouter"));

const proxyRoutes = require("./routes/proxy.routes");
app.use("/proxy", proxyRoutes);




// ✅ You forgot this line
app.use('/api/userpaths', userpathRouter);
app.use('/api/countries', countryRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/cities', cityRoutes);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));



/* ------------------- AWS S3: Presigned URL ------------------- */
app.post('/api/get-presigned-url', async (req, res) => {
  const { fileName, fileType } = req.body;

  const params = {
    Bucket: 'thenaaviversebucket',
    Key: fileName,
    ContentType: fileType,
    Expires: 900, // 15 minutes
  };

  try {
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    console.log('Generated Presigned URL:', presignedUrl);
    res.json({ presignedUrl });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});




/* ------------------- GOOGLE PLACES API ------------------- */
app.get('/api/places', async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY; // ✅ Move key to .env
  const { place_id } = req.query;

  if (!place_id) {
    return res.status(400).json({ error: 'Missing place_id parameter' });
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;

  try {
    const apiResponse = await axios.get(apiUrl);
    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching place details:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching place details' });
  }
});

// app.get('/api/countries', (req, res) => {
//   const fs = require('fs');
//   const path = require('path');
//   const filePath = path.join(__dirname, 'data', 'countries.json');
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: 'Unable to load country data' });
//     }
//     res.json(JSON.parse(data));
//   });
// });



app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend is running ✅" });
});


app.get("/api/apps/naavi", (req, res) => {
  res.json({
    app_code: "naavi",
    name: "Naaviverse Registration App"
  });
});


/* ------------------- ERROR HANDLING ------------------- */
// 404 Handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Global Error Handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

module.exports = app;
