const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} = require('../validations/maintenanceValidation');
const { ROLES } = require('../constants/roles');

router.post(
  '/',
  protect,
  restrictTo(ROLES.STUDENT),
  validate({ body: createMaintenanceSchema }),
  maintenanceController.createMaintenanceRequest
);

router.get(
  '/my',
  protect,
  restrictTo(ROLES.STUDENT),
  maintenanceController.getStudentMaintenanceRequests
);

router.get(
  '/landlord',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  maintenanceController.getLandlordMaintenanceRequests
);

router.patch(
  '/:id/status',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  validate({ body: updateMaintenanceSchema }),
  maintenanceController.updateMaintenanceStatus
);

module.exports = router;
