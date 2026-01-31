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
 * Check validation results
 * ************************** */
inventoryValidation.checkInventoryData = async (req, res, next) => {
  const { errors } = validationResult(req)
  if (errors.length > 0) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      ...req.body
    })
    return
  }
  next()
}

module.exports = inventoryValidation
