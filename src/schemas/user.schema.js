const { z } = require('zod');

const updateUserSchema = z.object({
  first_name: z.string().min(2).max(50).optional(),
  last_name: z.string().min(2).max(50).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

const upsertTrainerProfileSchema = z.object({
  specialty: z.enum([
    'HYPERTROPHY',
    'STRENGTH',
    'FAT_LOSS',
    'HEALTH_AND_REHABILITATION',
    'GENERAL_CONDITIONING',
  ]),
  biography: z.string().optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  phone: z.string().max(20).optional(),
  status: z.enum(['AVAILABLE', 'BUSY']).optional(),
});

const upsertClientProfileSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  height: z.number().positive().max(300).optional(),
  initial_body_fat_percentage: z.number().min(1).max(70).optional(),
  primary_goal: z.enum(['HYPERTROPHY', 'STRENGTH', 'FAT_LOSS', 'HEALTH']).optional(),
  experience_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  medical_condition: z.string().optional(),
});

module.exports = {
  updateUserSchema,
  upsertTrainerProfileSchema,
  upsertClientProfileSchema,
};