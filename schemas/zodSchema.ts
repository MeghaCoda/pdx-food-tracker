import { z } from "zod";

const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Must be in HH:MM format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Must be in HH:MM format"),
});

const hoursSchema = z.array(timeRangeSchema).default([]);

const LocationSchema = z.object({
  id: z.string(), // UUIDs are returned from supabase as strings
  name: z.string(),
  address: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  offerDesc: z.string(),
  offerSource: z.string(),
  website: z.url().optional().or(z.literal("")),
  donationLink: z.url().optional().or(z.literal("")),
  deliveryAvailable: z.boolean(),
  volunteerLink: z.url().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  hours: z.object({
    monday: hoursSchema,
    tuesday: hoursSchema,
    wednesday: hoursSchema,
    thursday: hoursSchema,
    friday: hoursSchema,
    saturday: hoursSchema,
    sunday: hoursSchema,
  }),
  infoLastVerified: z.string(),
  lastUpdated: z.string(),
  notes: z.string().optional(),
  verificationStatus: z.enum(['pending', 'confirmed', 'unverified']),
  ownerClaimed: z.boolean().nullable().optional(),
  ownerVerifiedAt: z.string().nullable().optional(),
});

const LocationInputSchema = LocationSchema.omit({ id: true, lastUpdated: true }).extend({
  verificationStatus: z.enum(['pending', 'confirmed', 'unverified']).default('unverified'),
});
const LocationUpdateSchema = LocationSchema.omit({ id: true, lastUpdated: true }).partial();

const VerificationEventSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  verifiedAt: z.string(),
  verifiedBy: z.string().nullable().optional(),
  method: z.enum(['phone', 'website', 'email', 'in-person', 'owner-portal']).nullable().optional(),
  outcome: z.enum(['confirmed', 'no-answer', 'info-updated', 'closed', 'unverifiable']).nullable().optional(),
  notes: z.string().nullable().optional(),
  isOwner: z.boolean().nullable().optional(),
});

const VerificationEventInputSchema = VerificationEventSchema.omit({ id: true }).extend({
  verifiedAt: z.string().default(() => new Date().toISOString()),
});const VerificationEventUpdateSchema = VerificationEventInputSchema.partial();

export { LocationSchema, LocationInputSchema, LocationUpdateSchema, VerificationEventSchema, VerificationEventInputSchema, VerificationEventUpdateSchema };
export type Location = z.infer<typeof LocationSchema>;
export type LocationInput = z.infer<typeof LocationInputSchema>;
export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;
export type VerificationEvent = z.infer<typeof VerificationEventSchema>;
export type VerificationEventInput = z.infer<typeof VerificationEventInputSchema>;
export type VerificationEventUpdate = z.infer<typeof VerificationEventUpdateSchema>;
