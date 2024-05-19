const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const recipeRoutes = require('./routes/recipeRoutes');


const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/recipe', recipeRoutes);

// Connect to MongoDB
mongoose.connect("mongodb://meal-planner:123@ac-qnpwilr-shard-00-00.wls9fh0.mongodb.net:27017,ac-qnpwilr-shard-00-01.wls9fh0.mongodb.net:27017,ac-qnpwilr-shard-00-02.wls9fh0.mongodb.net:27017/?ssl=true&replicaSet=atlas-qhqixn-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
