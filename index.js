const express= require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const equipmentRoutes = require("./routes/equipment"); 
dotenv.config();
const PORT = process.env.PORT || 5000;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Equipment API",
      version: "1.0.0",
      description: "API documentation for the Equipment Management System",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ["./routes/*.js"], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/equipment', require('./routes/equipment'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
