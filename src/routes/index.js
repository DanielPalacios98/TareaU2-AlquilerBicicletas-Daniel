const express = require('express');
const authController = require('../controllers/auth.controller');
const bikeController = require('../controllers/bike.controller');
const rentalController = require('../controllers/rental.controller');
const reportController = require('../controllers/report.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.post('/auth/register', asyncRoute(authController.register));
router.post('/auth/login', asyncRoute(authController.login));

router.get('/bikes', asyncRoute(bikeController.list));
router.get('/bikes/:id', asyncRoute(bikeController.get));
router.post('/bikes', requireAuth, asyncRoute(bikeController.create));
router.put('/bikes/:id', requireAuth, asyncRoute(bikeController.update));
router.delete('/bikes/:id', requireAuth, asyncRoute(bikeController.remove));

router.get('/rentals', requireAuth, asyncRoute(rentalController.list));
router.get('/rentals/with-bikes', requireAuth, asyncRoute(rentalController.joined));
router.get('/rentals/:id', requireAuth, asyncRoute(rentalController.get));
router.post('/rentals', requireAuth, asyncRoute(rentalController.create));
router.put('/rentals/:id/return', requireAuth, asyncRoute(rentalController.returnRental));
router.delete('/rentals/:id', requireAuth, asyncRoute(rentalController.remove));

router.get('/reports', requireAuth, asyncRoute(reportController.list));
router.post('/reports', requireAuth, asyncRoute(reportController.create));
router.delete('/reports/:id', requireAuth, asyncRoute(reportController.remove));

module.exports = router;
