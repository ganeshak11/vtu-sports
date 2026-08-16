// event-constants.ts
// This manages the time and date logistics for the VTU Athletics Meet

// Hardcode the event start date for this instance (2026-08-20)
// Using IST (Asia/Kolkata) which is UTC+5:30
export const EVENT_START_DATE_IST = '2026-08-20T00:00:00+05:30';
export const TOTAL_DAYS = 4;

export const MEAL_WINDOWS = {
  breakfast: { startHr: 7, startMin: 0, endHr: 10, endMin: 0 },
  lunch: { startHr: 12, startMin: 30, endHr: 15, endMin: 0 },
  dinner: { startHr: 19, startMin: 30, endHr: 22, endMin: 0 },
};

export type MealStatus = 'Consumed' | 'Available' | 'Expired' | 'Future';

/**
 * Returns the current date in Asia/Kolkata timezone
 */
export function getNowIST(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

/**
 * Returns the specific date for an event day (1-indexed) in IST
 */
export function getDateForDay(dayIndex: number): Date {
  const startDate = new Date(EVENT_START_DATE_IST);
  startDate.setDate(startDate.getDate() + (dayIndex - 1));
  return startDate;
}

/**
 * Validates if the current time is within the allowed window for a given meal.
 * Returns { valid: boolean, error?: string }
 */
export function validateMealTime(mealType: string): { valid: boolean; error?: string } {
  // mealType format: "day1_breakfast"
  const parts = mealType.split('_');
  if (parts.length !== 2) return { valid: false, error: 'Invalid meal format' };
  
  const dayStr = parts[0].replace('day', '');
  const dayIndex = parseInt(dayStr, 10);
  const mealName = parts[1] as keyof typeof MEAL_WINDOWS;

  if (isNaN(dayIndex) || dayIndex < 1 || dayIndex > TOTAL_DAYS) {
    return { valid: false, error: 'Invalid day' };
  }

  if (!MEAL_WINDOWS[mealName]) {
    return { valid: false, error: 'Invalid meal type' };
  }

  const now = getNowIST();
  const mealDate = getDateForDay(dayIndex);
  
  // Check if it's the correct day
  if (
    now.getFullYear() !== mealDate.getFullYear() ||
    now.getMonth() !== mealDate.getMonth() ||
    now.getDate() !== mealDate.getDate()
  ) {
    // Determine if it's past or future
    const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const mealStartOfDay = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());
    
    if (nowStartOfDay > mealStartOfDay) {
      return { valid: false, error: 'Meal has expired.' };
    } else {
      return { valid: false, error: 'Meal is not available yet.' };
    }
  }

  // Check the time window
  const currentHr = now.getHours();
  const currentMin = now.getMinutes();
  const window = MEAL_WINDOWS[mealName];

  const currentTimeVal = currentHr * 60 + currentMin;
  const startTimeVal = window.startHr * 60 + window.startMin;
  const endTimeVal = window.endHr * 60 + window.endMin;

  if (currentTimeVal < startTimeVal) {
    return { valid: false, error: `${mealName} starts at ${window.startHr}:${window.startMin.toString().padStart(2, '0')}.` };
  }

  if (currentTimeVal > endTimeVal) {
    return { valid: false, error: `${mealName} ended at ${window.endHr}:${window.endMin.toString().padStart(2, '0')}.` };
  }

  return { valid: true };
}

/**
 * Determines the display status for the UI badge
 */
export function getMealStatus(dayIndex: number, mealName: keyof typeof MEAL_WINDOWS, isConsumed: boolean): MealStatus {
  if (isConsumed) return 'Consumed';

  const now = getNowIST();
  const mealDate = getDateForDay(dayIndex);

  const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mealStartOfDay = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());

  if (nowStartOfDay > mealStartOfDay) return 'Expired';
  if (nowStartOfDay < mealStartOfDay) return 'Future';

  // It's today. Check time.
  const currentHr = now.getHours();
  const currentMin = now.getMinutes();
  const window = MEAL_WINDOWS[mealName];

  const currentTimeVal = currentHr * 60 + currentMin;
  const startTimeVal = window.startHr * 60 + window.startMin;
  const endTimeVal = window.endHr * 60 + window.endMin;

  if (currentTimeVal > endTimeVal) return 'Expired';
  if (currentTimeVal >= startTimeVal && currentTimeVal <= endTimeVal) return 'Available';
  
  return 'Future';
}
