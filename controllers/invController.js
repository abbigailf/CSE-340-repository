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

  // Build classification select list for the management view
  const classificationSelect = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect, // <-- pass it to the view
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  // Collect the inventory ID from the URL and cast it as an integer
  const inv_id = parseInt(req.params.invId)

  // Build the navigation menu
  let nav = await utilities.getNav()

  // Get all the inventory data for the selected vehicle
  const itemData = await invModel.getVehicleById(inv_id)

  // Build the classification select list and pre-select current classification
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

  // Create a variable with the vehicle make and model for display
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  // Render the edit inventory view
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  // Update the inventory item in the database
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    // Success message and redirect
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    // If update fails, re-render edit form with sticky data
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirm = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  const nav = await utilities.getNav()

  // Get inventory item data
  const itemData = await invModel.getVehicleById(inv_id)

  // Build vehicle name
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventory(inv_id)

  if (deleteResult) {
    req.flash("notice", "Vehicle successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Delete failed. Please try again.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont