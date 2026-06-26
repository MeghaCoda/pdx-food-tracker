import { z } from 'zod';
import { PhysicalLocationsSchema, ResourceHoursSchema } from '@/schemas/zodSchema';

export const PhysicalLocationInputSchema = PhysicalLocationsSchema
  .omit({ id: true, created_at: true, name: true })
  .extend({
    resource_hours: z.array(
      ResourceHoursSchema.omit({ id: true, physical_location_id: true })
    ).optional(),
  });

export const PhysicalLocationUpdateSchema = PhysicalLocationInputSchema.partial();

export type PhysicalLocationInput = z.infer<typeof PhysicalLocationInputSchema>;
export type PhysicalLocationUpdate = z.infer<typeof PhysicalLocationUpdateSchema>;
