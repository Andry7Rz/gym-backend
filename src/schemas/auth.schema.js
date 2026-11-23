const { z } = require('zod');

const registerSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  email: z.string().email('Formato de correo electrónico inválido').max(40),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Fecha de nacimiento inválida (usa formato YYYY-MM-DD)',
  }),
  role_code: z.enum(['ADM', 'TRN', 'CLI'], {
    message: 'El código de rol debe ser ADM, TRN o CLI',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Formato de correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

module.exports = { registerSchema, loginSchema };