const { z } = require('zod');

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
  .refine((val) => {
    const d = new Date(`${val}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
  }, 'Fecha inválida')
  .transform((val) => new Date(`${val}T00:00:00.000Z`));

const createAssignmentSchema = z
  .object({
    routine_id: z.number().int().positive('El ID de rutina debe ser un entero positivo'),
    client_id: z.number().int().positive('El ID de cliente debe ser un entero positivo'),
    start_date: dateOnlySchema,
    end_date: dateOnlySchema,
  })
  .refine((a) => a.end_date > a.start_date, {
    message: 'end_date debe ser posterior a start_date',
    path: ['end_date'],
  });

const clientIdParamSchema = z.object({
  clientId: z.coerce.number().int().positive('El ID de cliente debe ser un entero positivo'),
});

module.exports = { createAssignmentSchema, clientIdParamSchema };
