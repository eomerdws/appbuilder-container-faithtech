import * as v from 'valibot';

export const packageStatuses = ['PENDING', 'ACTIVE', 'REJECTED', 'INACTIVE'] as const;

export type PackageStatus = (typeof packageStatuses)[number];

export const credentialsSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email(), v.maxLength(320)),
  password: v.pipe(v.string(), v.minLength(1), v.maxLength(1_000))
});

const reasonSchema = v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(2_000)));

export const moderationSchema = v.object({
  status: v.picklist(packageStatuses),
  reason: reasonSchema
});

export const moderationActionSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  status: v.picklist(packageStatuses),
  reason: reasonSchema
});

export const searchSchema = v.object({
  q: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(200))),
  limit: v.optional(
    v.pipe(
      v.union([v.string(), v.number()]),
      v.transform(Number),
      v.number(),
      v.integer(),
      v.minValue(1),
      v.maxValue(100)
    ),
    25
  )
});
