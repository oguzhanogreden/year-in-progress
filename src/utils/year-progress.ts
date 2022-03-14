import { DateTime } from "luxon";

export const progress = () => {
  const now = DateTime.now();
  const startOfYear = DateTime.fromObject({
    year: now.year,
    day: 1,
    month: 1,
  });
  const endOfYear = startOfYear.plus({ year: 1 }).minus({ second: 1 });

  const yearDuration = endOfYear.minus(startOfYear.toMillis()).toMillis();

  const progress = now.minus(startOfYear.toMillis()).toMillis() / yearDuration;

  return +(progress * 100).toFixed(2);
};
