require("dotenv").config();
const express = require('express');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const session = require("express-session");
const dbConnect = require('./utils/dbConnect');
const userRoute = require('./routes/usersRoute');
const bookRoute = require('./routes/booksRoute');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errHandler');
const Book = require('./model/Book');
const app = express();

//db
dbConnect();
// configure session
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: 'mongodb+srv://SerenaWu:9LkYr2EOHGTKItey@book-directory-api.n2kmzye.mongodb.net/?retryWrites=true&w=majority',
        ttl: 24 * 60 * 60 // 1 day
    }),
}));

// middleware
app.use(express.json());
// pass incoming data from a form
app.use(express.urlencoded({extended: true}));

// config ejs
app.set("view engine", "ejs");
//server static files
app.use(express.static(__dirname, +"/public"));

//save the login user into locals
app.use((req, res, next) => {
    //check if a user is login
    if (req.session.authUser) {
        res.locals.authUser = req.session.authUser;
    } else {
        res.locals.authUser = null;
    }
    next();
});

// config flash
app.use(flash());

//------------
//routes
//------------
//home route

app.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.render("index", {
            books,
            error: req.flash("error"),
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/");
    }
});

app.use('/api', userRoute);
app.use('/api', bookRoute);

//not found
app.use(notFound);
app.use(errorHandler);

const isPasswordMatched = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log('Server is up and running'+ " " + PORT);
});