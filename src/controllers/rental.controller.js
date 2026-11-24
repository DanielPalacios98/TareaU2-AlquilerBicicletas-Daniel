const rentalService = require('../services/rental.service');

async function create(req, res) { res.status(201).json(await rentalService.create(req.user.sub, req.body)); }
async function list(req, res) { res.json(await rentalService.list(req.user.sub)); }
async function get(req, res) { res.json(await rentalService.get(req.user.sub, req.params.id)); }
async function joined(req, res) { res.json(await rentalService.joined(req.user.sub)); }
async function returnRental(req, res) { res.json(await rentalService.returnRental(req.user.sub, req.params.id)); }
async function remove(req, res) { res.json(await rentalService.remove(req.user.sub, req.params.id)); }

module.exports = { create, list, get, joined, returnRental, remove };
