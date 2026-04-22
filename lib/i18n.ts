export type Lang = 'he' | 'en';

const T = {
  // Nav
  home:       { he: 'בית',        en: 'Home'      },
  history:    { he: 'היסטוריה',   en: 'History'   },
  scan:       { he: 'סריקה',      en: 'Scan'      },
  goals:      { he: 'יעדים',      en: 'Goals'     },
  profile:    { he: 'פרופיל',     en: 'Profile'   },
  settings:   { he: 'הגדרות',     en: 'Settings'  },

  // Greetings
  goodMorning:   { he: 'בוקר טוב',      en: 'Good morning'   },
  goodAfternoon: { he: 'צהריים טובים',  en: 'Good afternoon' },
  goodEvening:   { he: 'ערב טוב',       en: 'Good evening'   },

  // Dashboard
  caloriesToday: { he: 'קלוריות היום',  en: 'Calories today' },
  ofGoal:        { he: 'מתוך יעד',      en: 'of goal'        },
  remaining:     { he: 'נותרו',          en: 'remaining'      },
  exceededBy:    { he: 'חרגת ב-',       en: 'Exceeded by'    },
  protein:       { he: 'חלבון',         en: 'Protein'        },
  carbs:         { he: 'פחמימות',       en: 'Carbs'          },
  fat:           { he: 'שומן',          en: 'Fat'            },
  calories:      { he: 'קלוריות',       en: 'Calories'       },

  // Meals
  breakfast: { he: 'ארוחת בוקר',   en: 'Breakfast' },
  lunch:     { he: 'ארוחת צהריים', en: 'Lunch'     },
  dinner:    { he: 'ארוחת ערב',    en: 'Dinner'    },
  snacks:    { he: 'חטיפים',       en: 'Snacks'    },
  tapToAdd:  { he: 'לחץ + להוסיף', en: 'Tap + to add' },

  // Scan
  scanFood:       { he: 'סריקת אוכל',        en: 'Scan Food'         },
  aiPhoto:        { he: 'צילום AI',           en: 'AI Photo'          },
  barcode:        { he: 'ברקוד',              en: 'Barcode'           },
  openCamera:     { he: 'פתח מצלמה',          en: 'Open Camera'       },
  captureAnalyze: { he: 'צלם ונתח',           en: 'Capture & Analyze' },
  uploadPhoto:    { he: 'העלה תמונה',         en: 'Upload Photo'      },
  analyzing:      { he: 'מנתח עם AI...',       en: 'Analyzing...'      },
  detectedFoods:  { he: 'מזונות שזוהו',        en: 'Detected foods'    },
  addToMeal:      { he: 'הוסף לארוחה',        en: 'Add to meal'       },
  scanAgain:      { he: 'סרוק שוב',           en: 'Scan again'        },
  barcodeNum:     { he: 'מספר ברקוד...',       en: 'Barcode number...' },
  scanBarcode:    { he: 'סרוק ברקוד',         en: 'Scan Barcode'      },
  pointAtBarcode: { he: 'כוון למצלמה לברקוד', en: 'Point at barcode'  },
  searching:      { he: 'מחפש...',            en: 'Searching...'      },
  productFound:   { he: 'מוצר נמצא ✓',        en: 'Product found ✓'   },
  addedSuccess:   { he: 'נוסף בהצלחה! 🎉',    en: 'Added! 🎉'         },
  highConf:       { he: 'ביטחון גבוה',        en: 'High confidence'   },
  medConf:        { he: 'ביטחון בינוני',      en: 'Medium confidence' },

  // Goals
  goalsTitle:   { he: 'יעדים',                  en: 'Goals'              },
  dailyGoals:   { he: 'הגדר יעדי תזונה יומיים', en: 'Set daily goals'    },
  saveGoals:    { he: 'שמור יעדים',             en: 'Save Goals'         },
  saved:        { he: 'נשמר! ✓',                en: 'Saved! ✓'           },
  weightLoss:   { he: 'ירידה במשקל',            en: 'Weight Loss'        },
  maintenance:  { he: 'תחזוקה',                 en: 'Maintenance'        },
  muscleGain:   { he: 'עלייה בשרירים',          en: 'Muscle Gain'        },
  athletic:     { he: 'ספורטאי',                en: 'Athletic'           },

  // History
  weekly:     { he: 'שבועי',    en: 'Weekly'    },
  log:        { he: 'יומן',     en: 'Log'       },
  today:      { he: 'היום',     en: 'Today'     },
  noMeals:    { he: 'אין ארוחות ביום זה', en: 'No meals this day' },
  avgCal:     { he: 'קל׳ ממוצע',    en: 'Avg cal'     },
  avgProtein: { he: 'חלבון ממוצע',  en: 'Avg protein' },
  daysLogged: { he: 'ימים מעוקבים', en: 'Days logged'  },

  // Profile
  account:       { he: 'חשבון',          en: 'Account'        },
  signOut:       { he: 'התנתק',          en: 'Sign Out'       },
  signOutConfirm:{ he: 'בטוח שתרצה להתנתק?', en: 'Sure you want to sign out?' },
  guest:         { he: 'אורח',           en: 'Guest'          },
  syncedGoogle:  { he: 'מחובר עם Google', en: 'Synced with Google' },

  // Settings
  language:    { he: 'שפה',       en: 'Language'    },
  theme:       { he: 'ערכת נושא', en: 'Theme'       },
  dark:        { he: 'כהה',       en: 'Dark'        },
  light:       { he: 'בהיר',      en: 'Light'       },
  system:      { he: 'מערכת',     en: 'System'      },
  currentWeight:{ he: 'משקל נוכחי', en: 'Current weight' },
  targetWeight: { he: 'משקל יעד',   en: 'Target weight'  },
  dailyCalGoal: { he: 'יעד קלורי יומי', en: 'Daily calorie goal' },
  dailyProtGoal:{ he: 'יעד חלבון יומי', en: 'Daily protein goal' },
  goal:         { he: 'מטרה',     en: 'Goal'        },

  // Login
  continueGoogle: { he: 'המשך עם Google', en: 'Continue with Google' },
  continueApple:  { he: 'המשך עם Apple',  en: 'Continue with Apple'  },
  continueGuest:  { he: 'כניסה ללא חשבון', en: 'Continue as Guest'   },
  noAccountNote:  { he: 'כניסה ללא חשבון לא שומרת נתונים בין מכשירים', en: 'Guest mode does not sync across devices' },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}
