const express = require('express');
const expressAsync = require('express-async-handler');
const bcrypt = require("bcryptjs");
const User = require('../model/User');
const userRoute = express.Router();

//render register form
userRoute.get("/users/register", (req, res) => {
    res.render("users/register", {
        error: req.flash("error"),
    });
});

// register
userRoute.post('/users/register', expressAsync(async (req, res) => {
    //check if a user is registered
    const foundUser = await User.findOne({
        email: req.body.email
    });
    if (foundUser) {
        req.flash("error", "User already exist");
        return res.redirect("/api/users/register");
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    try {
        const user = await User.create({
            fullName: req.body.fullName,
            email: req.body.email,
            password: hashedPassword,
        });
        //redirect to user profile page
        res.redirect("/api/users/login");
    } catch (error) {
        res.json(error);
    }
}));

// render login form
userRoute.get("/users/login", (req, res) => {
    res.render("users/login", {
        error: req.flash("error"),
    });
});

// login
userRoute.post('/users/login', expressAsync(async (req, res) => {
    console.log(req.body);
    try {
        //check if email exist
        const userFound = await User.findOne({
            email: req.body.email
        });
        if (!userFound) {
            //send err msg
            req.flash("error", "Invalid login credentials");
            return res.redirect("/api/users/login");
            }
        //check if password is valid
        const isPasswordMatched = await bcrypt.compare(
            req.body.password,
            userFound.password);
        if (!isPasswordMatched) {
            //send err msg
            req.flash("error", "Invalid login credentials");
            return res.redirect("/api/users/login");
            }

        // put the user into session
        req.session.authUser = userFound;
        //redirect to profile page
        res.redirect(`/api/profile/${userFound_id}`);
    } catch (error) {
        res.json(error);
    }
}));

// log out
userRoute.get('/users/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect("/api/users/login")
    });
});

// fetch users
userRoute.get('/users', async (req, res) => {
    console.log(req.session);
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.json(error);
    }
});

// fetch user
userRoute.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

// user profile
userRoute.get("/profile/:id", async (req, res) => {
    //check if user login
    if (!req.session.authUser) {
        return res.json("Access denied please login again");
    }
    try {
        const user = await User.findById(req.params.id);
        res.render("users/profile", {
            user,
        });  
    } catch (error) {
        res.json(error);
    }
});

// user update
userRoute.put('/users/:id', async (req, res) => {
    try {
        res.json({
            msg: 'update user endpoint',
        });
    } catch (error) {
        res.json(error);
    }
});

module.exports = userRoute;