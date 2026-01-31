const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  
  /* Safety check: ensure data exists before accessing index 0 */
  if (!data || data.length === 0) {
    const err = new Error("No vehicles found for this classification")
    err.status = 404
    return next(err)
  }

  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getVehicleById(inv_id)

  /* STEP 4 UPDATE: Safety check to prevent crashing on undefined data */
  if (!data) {
    const err = new Error("Vehicle not found")
    err.status = 404
    return next(err)
  }

  const nav = await utilities.getNav()
  const detailHTML = await utilities.buildVehicleDetail(data)

  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detail: detailHTML,
  })
}

/* ***************************
 * Task 3: Intentional 500 error
 * ************************** */
invCont.throwError = async function (req, res, next) {
  // This triggers the error handler in server.js
  throw new Error("Intentional 500 error")
}

/* ***************************
 * Build inventory management view
 * *************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
  })
}

/* ***************************
 * Build add classification view
 * *************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
  })
}

/* ***************************
 * Process add classification
 * *************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body

  const nameRegex = /^[A-Za-z0-9]+$/
  if (!classification_name || !nameRegex.test(classification_name)) {
    req.flash("notice", "Classification name cannot contain spaces or special characters.")
    return res.redirect("/inv/add-classification")
  }

  const result = await invModel.addClassification(classification_name)

  if (result.rowCount === 1) {
    req.flash("notice", "Classification added successfully.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Classification insert failed.")
    res.redirect("/inv/add-classification")
  }
}

/* ***************************
 * Build add inventory view
 * *************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    errors: null,
  })
}

invCont.addInventory = async function (req, res) {
  const result = await invModel.addInventory(req.body)

  if (result) {
    req.flash("notice", "Vehicle added successfully.")
    res.redirect("/inv/")
  } else {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: [{ msg: "Sorry, the vehicle could not be added." }],
      ...req.body
    })
  }
}

module.exports = invCont