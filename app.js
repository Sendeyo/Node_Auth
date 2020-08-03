const express = require('express')
const ejs = require("ejs")
const bcrypt = require("bcrypt")
const session = require("express-session")
const flash = require("express-flash")

const app = express()
const port = 9999

app.set("view-engine", "ejs")
app.use(express.urlencoded({ extended: false}))

const passport = require("passport")
const initializePassport = require("./passport-config")
initializePassport(
    passport,
    email => Users.find(user => user.email === email),
    id => Users.find(user => user.id === id)
);


app.use(flash())
app.use(session({
    secret: "This`is_something-secret&uniQue",
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session());

const Users = [];

function authenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        return res.redirect("/login")
    }
}

function unAuthenicated(req, res, next){
    if (!req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/")
    }
}

app.get('/', authenticated, (req, res) =>{
    res.render('index.ejs', {user: req.user})
})

app.get('/register', unAuthenicated, (req, res) =>{
    res.render('register.ejs')
})

app.post("/register", unAuthenicated, async (req, res) =>{
    try {
        const hashedPass = await bcrypt.hash(req.body.password, 10);
        const user = {
            id: Date.now().toString(),
            email: req.body.email,
            password: hashedPass
        }
        Users.push(user)
        res.redirect("/login")
    } catch (error) {
        res.redirect("/register")   
    }
})


app.get('/login', unAuthenicated, (req, res) =>{
    res.render('login.ejs')
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
}))


app.get('/logout', authenticated, (req, res) =>{
    req.logOut()
    res.redirect("/login")
})

app.get('/forgot_password', (req, res) =>{
    res.render('index.ejs', {name: "max"})
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))