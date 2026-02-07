const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null // Added to prevent breaking on initial load
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null 
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      )

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
        })
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        })
      }

      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 * Deliver Account Management View
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  
  // Get account info from JWT middleware
  const { account_firstname, account_type, account_id } = res.locals.accountData

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    firstName: account_firstname,
    accountType: account_type,
    accountId: account_id,
    errors: null
  })
}

async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const accountId = req.params.accountId
  const accountData = await accountModel.getAccountById(accountId)

  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    accountData,
    errors: null
  })
}

async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (result) {
    req.flash("notice", "Account successfully updated")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Update failed")
    res.redirect(`/account/update/${account_id}`)
  }
}

async function updatePassword(req, res, next) {
    const { account_id, account_password } = req.body
    try {
        const hashedPassword = await bcrypt.hash(account_password, 10)
        const result = await accountModel.updatePassword(account_id, hashedPassword)

        if (result) {
            req.flash("notice", "Password successfully updated")
            res.redirect("/account/")
        } else {
            req.flash("notice", "Password update failed")
            res.redirect(`/account/update/${account_id}`)
        }
    } catch (error) {
        next(error)
    }
}

// Export all controller functions
module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updatePassword }
