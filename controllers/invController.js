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

module.exports = invCont