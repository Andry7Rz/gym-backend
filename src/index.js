const express = require('express');
const cors = require('cors');
require('dotenv').config();

const exerciseRoutes = require('./routes/exercise.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a Gym Management API', status: 'Online' });
});

// Ruta de verificación rápida
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API del Gimnasio funcionando correctamente' });
});

// Rutas de módulos
app.use('/api/exercises', exerciseRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});