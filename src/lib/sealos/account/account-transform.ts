// Data transformation functions
/**
 * Transform raw account amount response
 */
export const transformAccountAmountIntoBalance = (rawData: any) => {
  const { balance, deductionBalance } = rawData;
  // Convert to correct unit and subtract
  const result = Math.floor((balance - deductionBalance) / 1_000_000);
  return result;
};
