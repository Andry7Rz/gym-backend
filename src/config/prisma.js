const { PrismaClient } = require('@prisma/client'); //ruta en el cleinte
const prisma = new PrismaClient();  
module.exports = prisma; //unica conexion y se export a los demas modulos wasza