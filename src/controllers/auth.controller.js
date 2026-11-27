const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { registerSchema, loginSchema } = require('../schemas/auth.schema');

// registro del usuario 

const register = async (req, res) => {
   try {
    const validation = registerSchema.safeParse(req.body);
       if (!validation.success) {

        //revision ahi, para ver el error en postman
      return res.status(400).json({
        error: 'Datos no validos',
        detalles: validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
           });
    }


    //cuando se valide los datos "registrados", aahora si verificar si existe

    const { first_name, last_name, email, password, birth_date, role_code, gender } = validation.data;


    


    // 1. Verificar si el correo ya existe en "users"
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'el correo ya existe' });
    }

    // Encriptar 
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. llamada a prisma para crear el usuario
    const newUser = await prisma.users.create({
      data: {
        first_name,
        last_name,
        email,
        password_hash: hashedPassword,
        birth_date: new Date(birth_date),
        role_code,
        gender: gender || null,
      },
      select: {
        id: true,
        role_code: true,
        first_name: true,
        last_name: true,
        email: true,
        gender: true,
        profile_status: true,
        created_at: true,
      },
    });

    res.status(201).json({
      message: 'Usuario registrado',
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario', detalle: error.message });
  }
};








// INICIO DE SESIÓN (LOGIN)
const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos no validos',
        detalles: validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || user.profile_status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Credenciales incorrectas o cuenta inactiva' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role_code: user.role_code },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        role_code: user.role_code,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión', detalle: error.message });
  }
};

module.exports = { register, login };