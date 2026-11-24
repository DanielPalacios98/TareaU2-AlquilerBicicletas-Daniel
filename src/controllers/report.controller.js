const reportService = require('../services/report.service');

async function create(req, res) { res.status(201).json(await reportService.create(req.user.sub, req.body)); }
async function list(req, res) { res.json(await reportService.list(req.user.sub)); }
async function remove(req, res) { res.json(await reportService.remove(req.user.sub, req.params.id)); }

module.exports = { create, list, remove };
