const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const { uploadSlip } = require('../middlewares/uploadMiddleware');
const validate = require('../middlewares/validate');
const {
  createInvoiceSchema,
  verifyInvoiceSchema,
} = require('../validations/invoiceValidation');
const { ROLES } = require('../constants/roles');

router.post(
  '/',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  validate({ body: createInvoiceSchema }),
  invoiceController.createInvoice
);

router.get(
  '/my',
  protect,
  restrictTo(ROLES.STUDENT),
  invoiceController.getStudentInvoices
);

router.get(
  '/landlord',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  invoiceController.getLandlordInvoices
);

router.patch(
  '/:id/slip',
  protect,
  restrictTo(ROLES.STUDENT),
  uploadSlip.single('slip'),
  invoiceController.submitPaymentSlip
);

router.patch(
  '/:id/verify',
  protect,
  restrictTo(ROLES.LANDLORD, ROLES.ADMIN),
  validate({ body: verifyInvoiceSchema }),
  invoiceController.verifyPaymentSlip
);

module.exports = router;
