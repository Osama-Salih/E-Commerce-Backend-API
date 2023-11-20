const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const { webhookCheckout } = require('./services/orderService');

dotenv.config({ path: './config.env' });
const dbConnection = require('./config/database');

// Routes
const mountRoutes = require('./routes');

// Errors
const ApiError = require('./utils/ApiError');
const globalError = require('./middlewares/errorMiddleware');

// Connect with db
dbConnection();

const app = express();

app.use(cors()); //Enable other domains to access your application
app.options('*', cors());

app.use(compression()); // compress all responses
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// SECURITY
app.use(express.json({ limit: '20kb' }));

// To apply data sanitization
app.use(mongoSanitize());
app.use(helmet());
// Limit each IP to 100 requests per `window` (here, per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});
// Apply the rate limiting middleware to all requests.
app.use('/api', limiter);

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      'quantity',
      'ratingsAverage',
      'sold',
      'price',
      'ratingsQuantity',
    ],
  }),
);

// Checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout,
);

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);
const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App runing on port ${port}`),
);

// Handle rejections outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`shutting down...`);
    process.exit(1);
  });
});
