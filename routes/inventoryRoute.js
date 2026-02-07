// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

/* ***************************
 * Public Inventory Routes
 * *************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildDetailView)
)

/* ***************************
 * Inventory Management Routes
 * (Employee / Admin only)
 * *************************** */

// Management view
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildManagement)
)

// Add classification
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.addClassification)
)

// Add inventory
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Inventory JSON (used by management view)
router.get(
  "/getInventory/:classification_id",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Edit inventory
router.get(
  "/edit/:invId",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildEditInventory)
)

// Update inventory
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.updateInventory)
)

// Delete confirmation
router.get(
  "/delete/:inv_id",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Process delete
router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkAdminEmployee,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router
