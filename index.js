const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const { connectToDatabase } = require('./db');
let port = process.env.PORT || 8081;
const productRoutes = require('./routes/products');


app.use(express.json());
app.use(cookieParser());
app.use(cors())


connectToDatabase()

connectToDatabase()
  .then(() => {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);

    app.use('/api/products', productRoutes);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
  });