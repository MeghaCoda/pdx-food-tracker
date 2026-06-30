import { z } from "zod";

// ============================================================
// ENUMS
// ============================================================

export const UserRoleSchema = z.enum(["admin", "owner", "contributor", "viewer"]);

export const BenefitCategorySchema = z.enum([
  "free_food",
  "discounted_food",
  "snap_accepted",
  "student_discount",
  "senior_discount",
  "kids_eat_free",
  "bogo",
  "coupon",
  "free_breakfast",
  "other",
  "military_discount",
]);

export const SubmissionStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const EditStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const DayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const VerificationStatusSchema = z.enum(["pending", "verified", "rejected"]);

// ============================================================
// USERS
// ============================================================

export const UsersSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  email: z.string().email(),
  role: UserRoleSchema,
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type User = z.infer<typeof UsersSchema>;

// ============================================================
// RESOURCES
// ============================================================

export const ResourcesSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  offer_desc: z.string().nullable().optional(),
  offer_source: z.string().nullable().optional(),
  benefits: z.array(BenefitCategorySchema).nullable().optional(),
  verification_status: SubmissionStatusSchema.nullable().optional(),
  expires_at: z.string().nullable().optional(), // date string e.g. "2025-12-31"
  is_active: z.boolean().nullable().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
  updated_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type Resource = z.infer<typeof ResourcesSchema>;

// ============================================================
// OWNERS
// ============================================================

export const OwnersSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  resource_id: z.string().uuid(),
  verification_status: z.string().min(1),
  verification_method: z.enum(["phone", "document", "email_domain"]).nullable().optional(),
  verification_notes: z.string().nullable().optional(),
  verified_at: z.string().datetime({ offset: true }).nullable().optional(),
  verified_by: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type Owner = z.infer<typeof OwnersSchema>;

// ============================================================
// PHYSICAL LOCATIONS
// ============================================================

export const PhysicalLocationsSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  name: z.string().nullable().optional(),
  address: z.string().min(1),
  address2: z.string().nullable().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(5).max(10),
  neighborhood: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  phone_number: z.string().nullable().optional(),
  verification_status: SubmissionStatusSchema.nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type PhysicalLocation = z.infer<typeof PhysicalLocationsSchema>;

// ============================================================
// ONLINE ACCESS
// ============================================================

export const OnlineAccessSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  url: z.string().url(),
  instructions: z.string().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type OnlineAccess = z.infer<typeof OnlineAccessSchema>;

// ============================================================
// OTHER ACCESS
// ============================================================

export const OtherAccessSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  notes: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type OtherAccess = z.infer<typeof OtherAccessSchema>;

// ============================================================
// RESOURCE BENEFITS
// ============================================================

export const ResourceBenefitsSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  benefit: BenefitCategorySchema,
  notes: z.string().nullable().optional(),
});

export type ResourceBenefit = z.infer<typeof ResourceBenefitsSchema>;

// ============================================================
// RESOURCE HOURS
// ============================================================

export const ResourceHoursSchema = z.object({
  id: z.string().uuid(),
  physical_location_id: z.string().uuid(),
  day: DayOfWeekSchema,
  opens_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Must be a valid time e.g. 09:00"),
  closes_at: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Must be a valid time e.g. 17:00"),
  notes: z.string().nullable().optional(),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
});

export type ResourceHours = z.infer<typeof ResourceHoursSchema>;

// ============================================================
// RESOURCE ELIGIBILITY
// ============================================================

export const ResourceEligibilitySchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  income_limit: z.string().nullable().optional(),
  id_required: z.boolean().nullable().optional(),
  residency_required: z.boolean().nullable().optional(),
  referral_required: z.boolean().nullable().optional(),
  other_requirements: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type ResourceEligibility = z.infer<typeof ResourceEligibilitySchema>;

// ============================================================
// VERIFICATION EVENTS
// ============================================================

export const VerificationEventsSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid().nullable().optional(),
  physical_location_id: z.string().uuid().nullable().optional(),
  owner_id: z.string().uuid().nullable().optional(),
  verified_at: z.string().datetime({ offset: true }).nullable().optional(),
  verified_by: z.string().uuid().nullable().optional(),
  method: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type VerificationEvent = z.infer<typeof VerificationEventsSchema>;

// ============================================================
// COMMUNITY NOTES
// ============================================================

export const CommunityNotesSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  author_id: z.string().uuid(),
  body: z.string().min(1),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  is_flagged: z.boolean().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type CommunityNote = z.infer<typeof CommunityNotesSchema>;

// ============================================================
// SUBMISSIONS
// ============================================================

export const SubmissionsSchema = z.object({
  id: z.string().uuid(),
  submitted_by: z.string().uuid(),
  status: SubmissionStatusSchema,
  reviewed_by: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  benefits: z.array(BenefitCategorySchema).nullable().optional(),
  access_notes: z.string().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type Submission = z.infer<typeof SubmissionsSchema>;

// ============================================================
// EDITS
// ============================================================

export const EditsSchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  submitted_by: z.string().uuid(),
  status: EditStatusSchema,
  reviewed_by: z.string().uuid().nullable().optional(),
  field_name: z.string().min(1),
  old_value: z.string().nullable().optional(),
  new_value: z.string().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type Edit = z.infer<typeof EditsSchema>;

// ============================================================
// EDIT HISTORY
// ============================================================

export const EditHistorySchema = z.object({
  id: z.string().uuid(),
  resource_id: z.string().uuid(),
  edit_id: z.string().uuid().nullable().optional(),
  changed_by: z.string().uuid(),
  approved_by: z.string().uuid().nullable().optional(),
  field_name: z.string().min(1),
  old_value: z.string().nullable().optional(),
  new_value: z.string().nullable().optional(),
  changed_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export type EditHistory = z.infer<typeof EditHistorySchema>;

// ============================================================
// RESOURCE WITH LOCATION (joined view for map)
// ============================================================

export const ResourceWithLocationSchema = ResourcesSchema.extend({
  physical_location: PhysicalLocationsSchema.extend({
    resource_hours: z.array(ResourceHoursSchema.omit({ physical_location_id: true })),
  }),
});

export type ResourceWithLocation = z.infer<typeof ResourceWithLocationSchema>;

// ============================================================
// ARRAY SCHEMAS (for validating lists of records from DB queries)
// ============================================================

export const UsersArraySchema = z.array(UsersSchema);
export const ResourcesArraySchema = z.array(ResourcesSchema);
export const OwnersArraySchema = z.array(OwnersSchema);
export const PhysicalLocationsArraySchema = z.array(PhysicalLocationsSchema);
export const OnlineAccessArraySchema = z.array(OnlineAccessSchema);
export const OtherAccessArraySchema = z.array(OtherAccessSchema);
export const ResourceBenefitsArraySchema = z.array(ResourceBenefitsSchema);
export const ResourceHoursArraySchema = z.array(ResourceHoursSchema);
export const ResourceEligibilityArraySchema = z.array(ResourceEligibilitySchema);
export const VerificationEventsArraySchema = z.array(VerificationEventsSchema);
export const CommunityNotesArraySchema = z.array(CommunityNotesSchema);
export const SubmissionsArraySchema = z.array(SubmissionsSchema);
export const EditsArraySchema = z.array(EditsSchema);
export const EditHistoryArraySchema = z.array(EditHistorySchema);

// ============================================================
// SAFE PARSE HELPER (with detailed error logging)
// ============================================================

export function safeParsWithDebug<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label?: string
): T | null {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`Zod validation failed${label ? ` [${label}]` : ""}:`);
    result.error.issues.forEach((issue) => {
      const index = issue.path[0];
      const field = issue.path[1];
      const failedRecord = Array.isArray(data) ? (data as any[])[index as number] : data;

      console.error({
        message: issue.message,
        field,
        index,
        failedRecord,
        recordId: failedRecord?.id ?? null,
      });
    });
    return null;
  }

  return result.data;
}
