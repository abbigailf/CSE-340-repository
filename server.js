/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")   // <-- REQUIRED for nav on errors
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 * ************************/
 app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(cookieParser())

app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", baseController.buildHome)

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res, next) => {
  const err = new Error("I'm sorry, we couldn't find that page.")
  err.status = 404
  next(err) // Send it to the 500 handler
})

/* ***********************
 * 500 Error Handler - This handles 404s AND 500s
 *************************/
app.use(async (err, req, res, next) => {
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  // 1. Fetch nav or fallback. This PREVENTS the layout crash.
  let nav = await utilities.getNav().catch(() => "<ul><li><a href='/'>Home</a></li></ul>")
  
  // 2. This is the magic line. It checks if the error is a 404 or 500.
  const status = err.status || 500
  
  // 3. This sets the title that your error.ejs uses for the icon.
  const title = (status === 404) ? "404 - Page Not Found" : "500 - Server Error"
  
  // 4. Render the error view WITH the layout
  res.status(status).render("errors/error", {
    title,
    nav,
    message: err.message || "An unexpected error occurred.",
    layout: "./layouts/layout"   // <--- THIS LINE FIXES THE VALIDATOR ERRORS!
  })
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})