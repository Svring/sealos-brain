import { z } from "zod";

// Schema for account amount API response
export const AccountAmountResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.object({
    balance: z.number(),
    deductionBalance: z.number(),
  }),
});

// Schema for the transformed account amount data
export const AccountAmountDataSchema = z.object({
  balance: z.number(),
  deductionBalance: z.number(),
  validBalance: z.number(), // calculated balance - deductionBalance
});

// Type exports
export type AccountAmountResponse = z.infer<typeof AccountAmountResponseSchema>;
export type AccountAmountData = z.infer<typeof AccountAmountDataSchema>;
