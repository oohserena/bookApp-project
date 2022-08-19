const express = require('express');
const expressAsync = require('express-async-handler');
const { redirect } = require('express/lib/response');
const Book = require('../model/Book');
const User = require('../model/User');
const bookRoute = express.Router();

//render add book form
bookRoute.get("/books", (req, res) => {
    //check if user is logged in
    if (!req.session.authUser) {
        return res.redirect("/api/users/login");
    }
    res.render("book/addBook", {
        error: req.flash("error"),
    });
});

//create book
bookRoute.post('/api/books', expressAsync(async (req, res) => {
    //check if user is logged in
    if (!req.session.authUser){
        //send err msg
        req.flash("error", 'Please login before creating')
        return res.redirect("/api/books")
    }
    // check if book exist
    const bookFound = await Book.findOne({
        title: req.body.title
    });

    if (bookFound) {
        //send err msg
        req.flash(
            "error",
            `This book with the title ${req.body.title} already exist`
        );
        return res.redirect("/api/books");
    }
    
    
    try {
        // create book
        const book = await Book.create({
            title: req.body.title,
            desc: req.body.desc,
            author: req.body.author,
            isbn: req.body.isbn,
            createdBy: req.session.authUser._id,
            category: req.body.category,
        });

        // find the user
        const user = await User.findById(req.session.authUser._id);
        // push the created book into the field of found user
        user.books.push(book);

        //save user
        await user.save();

        //redirect to user profile page
        res.redirect(`/api/profile/${user._id}`);
    } catch (error) {
        //send err msg
        req.flash("error", error.message);
        return res.redirect("/api/books");
    }
}));

//fetch all books
bookRoute.get('/books', expressAsync(async (req, res) => {
    try {
        const books = await Book.find().populate('createdBy');
        res.json(books);
    } catch (error) {
        res.json(error);
    }
}));

//fetch book
bookRoute.get('/books/:id', expressAsync(async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        res.render("books/editBook", {
            book,
            error: req.flash("error"),
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/");
    }
}));

//delete book
bookRoute.delete('/books/delete/:id', expressAsync(async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (error) {
        res.send("Book delete failed");
    }
}));

//update book
bookRoute.put('/books/:id', expressAsync(async (req, res) => {
    try {
        const bookUpdated = await Book.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            });
        res.redirect("/");
    } catch (error) {
        req.flash("error", error.message);
        redirect(`/api/books/${req.params.id}`);
    }
}));

module.exports = bookRoute;