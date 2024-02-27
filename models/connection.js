//--> connection à la base de donnée

const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://admin:zyueZHawkcxg8Dg2@cluster0.gb1qc4p.mongodb.net/tickethack';

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
 .then(() => console.log('Database connected'))

  .catch(error => console.error(error));