import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString();
}

export function formatMacro(val: number): string {
  return Math.round(val).toString();
}

export function getProgressColor(percent: number): string {
  if (percent >= 100) return '#F87171'; // red - over
  if (percent >= 85) return '#FB923C'; // orange - near limit
  return '#4ADE80'; // green - good
}

export function getMealEmoji(mealType: string): string {
  const emojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍎',
  };
  return emojis[mealType] || '🍽️';
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function dataURLToBase64(dataURL: string): string {
  return dataURL.split(',')[1];
}
