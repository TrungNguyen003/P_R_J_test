const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const path = require('path');
const config = require('./config/database');
const yaml = require('js-yaml');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const cookieParser = require('cookie-parser');
const app = express();

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(fileUpload());

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());


app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function (req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Sử dụng cookie-parser
app.use(cookieParser());

// Middleware isAuthenticated
const { isAuthenticated } = require('./middleware/auth');

app.use('/some-route', isAuthenticated, (req, res) => {
  res.send('You are authenticated');
});

require('dotenv').config();
// Đọc tệp swagger.yaml
// const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));


require('./swagger')(app);

const products = require('./routes/products');
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');
const imagesRouter = require('./routes/images');
const users = require('./routes/users');
const adminProducts = require('./routes/admin_products');
const adminCategories = require('./routes/admin_categories');
const cartRoutes = require("./routes/cart");
const adminUsers = require('./routes/admin_users');
const orderRouter = require("./routes/orders");
const webhooks = require("./routes/webhooks");
// Example of setting a cookie with the correct attributes
app.get('/set-cookie', (req, res) => {
  res.cookie('example', 'value', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  res.send('Cookie set');
});

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/orders", orderRouter);
app.use('/product_images', express.static('public/product_images'));
app.use("/webhooks", webhooks);
app.use('/', products);
app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/cart', cartRoutes);
app.use('/admin/categories', adminCategories);
app.use('/', imagesRouter);
app.use('/users', users);
app.use('/admin/products', adminProducts);
app.use('/admin/categories', adminCategories);
app.use('/admin/users', adminUsers);
app.get('/', function (req, res) {
  res.send('Welcome to the homepage');
});

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});
