const { z } = require('zod');

const createExerciseSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().optional(),
  muscle_group: z.enum(['CHEST', 'BACK', 'QUADRICEPS', 'HAMSTRINGS', 'SHOULDERS', 'ARMS', 'CORE']),
  equipment_required: z.enum([
    'DUMBBELLS',
    'BARBELL',
    'CABLE',
    'MACHINE',
    'BODYWEIGHT',
    'RESISTANCE_BAND',
    'WEIGHT_PLATE',
    'MEDICINE_BALL',
    'SUSPENSION_TRAINER',
    'KETTLEBELL',
  ]),
  difficulty_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
});

const updateExerciseSchema = createExerciseSchema.partial();

module.exports = { createExerciseSchema, updateExerciseSchema };