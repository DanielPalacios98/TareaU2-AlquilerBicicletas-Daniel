const bikeService = require('../services/bike.service');

async function list(req, res) { res.json(await bikeService.list(req.query)); }
async function get(req, res) { res.json(await bikeService.get(req.params.id)); }
async function create(req, res) { res.status(201).json(await bikeService.create(req.body)); }
async function update(req, res) { res.json(await bikeService.update(req.params.id, req.body)); }
async function remove(req, res) { res.json(await bikeService.remove(req.params.id)); }

module.exports = { list, get, create, update, remove };
