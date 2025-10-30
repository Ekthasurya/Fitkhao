export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return null;
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);
  let status = "medium";
  if (bmi < 18.5) status = "low";
  else if (bmi < 25) status = "good";
  else status = "medium";
  return { bmi: Number(bmi.toFixed(1)), status };
};
