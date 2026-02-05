const utilities = require(".")
const { body, validationResult } = require("express-validator")

const inventoryValidation = {}

/* ***************************
 * Add Inventory Validation Rules
 * ************************** */
inventoryValidation.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
      
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),
      
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),
      
    body("inv_year")
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be a valid 4-digit year."),
      
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
      
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),
      
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
      
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
      
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
      
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required.")
  ]
}

/* ***************************
 * Check validation results for Add Inventory
 * ************************** */
inventoryValidation.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body
    })
    return
  }
  next()
}

/* ***************************
 * Check validation results for Update Inventory
 * Redirects back to edit view if errors exist
 * ************************** */
inventoryValidation.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    const title = `Edit ${inv_make} ${inv_model}`

    return res.render("./inventory/edit-inventory", {
      title,
      nav,
      classificationSelect: classificationList,
      errors: errors.array(),
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
  next()
}

module.exports = inventoryValidation
