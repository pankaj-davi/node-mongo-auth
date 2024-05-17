const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db');
const {verifyAccessToken} = require('./middleware')

router.get('/', verifyAccessToken , async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const db = await getDatabase();

    let resultsPerPage = limit;
    const results = await db.collection("pro")
      .find({})
      .sort({ date: -1 })
      .skip(skip)
      .limit(resultsPerPage + 1) 
      .toArray();


    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
