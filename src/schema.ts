import { z } from "zod";

const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Must be in HH:MM format"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Must be in HH:MM format"),
});

const hoursSchema = z.array(timeRangeSchema).default([]);

const ResourceItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  latLon: z.tuple([z.number(), z.number()]),
  offerDesc: z.string(),
  offerSource: z.string(),
  snapRequired: z.boolean(),
  website: z.url().optional(),
  donationLink: z.url().optional(),
  deliveryAvailable: z.boolean(),
  volunteerLink: z.url().optional(),
  phoneNumber: z.number().or(z.literal("")),
  hours: {
    monday: hoursSchema,
    tuesday: hoursSchema,
    wednesday: hoursSchema,
    thursday: hoursSchema,
    friday: hoursSchema,
    saturday: hoursSchema,
    sunday: hoursSchema
  },
  infoLastVerified: z.string(),
  lastUpdated: z.string(),
  notes: z.string().optional()
});

export type ResourceItemType = z.infer<typeof ResourceItemSchema>;
