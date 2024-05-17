const express = require('express');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

let client, db;

async function connectToDatabase() {
  try {
    client = await MongoClient.connect(uri, { useUnifiedTopology: true });
    db = client.db();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

function getDatabase() {
  return db;
}

module.exports = { connectToDatabase, getDatabase };