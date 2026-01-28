// Needed resources
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

// Route to build login view
// This path reflects ONLY what comes after "/account"
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Export router
module.exports = router