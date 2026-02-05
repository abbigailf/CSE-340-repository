// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
const { body, validationResult } = require("express-validator")

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetailView));
router.get("/trigger-error", utilities.handleErrors(invController.throwError));

/* ***************************
 * Inventory Management Routes
 * *************************** */

// Management view (Task 1)
router.get("/", utilities.handleErrors(invController.buildManagement))

// Add classification (Task 2)
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post("/add-classification", utilities.handleErrors(invController.addClassification))

// Add inventory (Task 3)
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Return inventory items as JSON (for inventory management view)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ***************************
 * Edit Inventory Item Route
 * ************************** */
router.get(
  "/edit/:invId",
  utilities.handleErrors(invController.buildEditInventory)
)

/* ***************************
 * Update inventory item
 * *************************** */
router.post(
  "/update",
  utilities.handleErrors(invController.updateInventory)
)

/* ***************************
 * Deliver delete confirmation view
 * ************************** */
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteConfirmation)
)

/* ***************************
 * Process inventory delete
 * ************************** */
router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;