const { z } = require('zod');

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
  .refine((val) => {
    const d = new Date(`${val}T00:00:00.000Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === val;
  }, 'Fecha inválida')
  .transform((val) => new Date(`${val}T00:00:00.000Z`));

const createHistorySchema = z.object({
  client_id: z.number().int().positive('El ID de cliente debe ser un entero positivo').optional(),
  recorded_date: dateOnlySchema,
  weight_kg: z
    .number()
    .positive('El peso debe ser mayor a 0')
    .max(999.99, 'El peso no puede superar 999.99 kg')
    .nullable()
    .optional(),
  body_fat_percentage: z
    .number()
    .min(0, 'El porcentaje de grasa corporal no puede ser negativo')
    .max(99.99, 'El porcentaje de grasa corporal debe ser menor a 100')
    .nullable()
    .optional(),
  client_comment: z.string().trim().nullable().optional(),
  trainer_comment: z.string().trim().nullable().optional(),
});

const clientIdParamSchema = z.object({
  clientId: z.coerce.number().int().positive('El ID de cliente debe ser un entero positivo'),
});

module.exports = { createHistorySchema, clientIdParamSchema };
