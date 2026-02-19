// src/utils/gemini.js
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ CRITICAL: VITE_GEMINI_API_KEY not found in .env file')
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

// INTERNAL STATE FOR RATE LIMITING
let isCooldownActive = false;

// ============================================================
// FALLBACK DATA (Your exact original data)
// ============================================================
const FALLBACK_WORKOUTS = {
  full_gym: {
    muscle_gain: [
      { name: 'Barbell Bench Press', sets: '4', reps: '8-12', equipment: 'Barbell', notes: 'Focus on mind-muscle connection' },
      { name: 'Barbell Squat', sets: '4', reps: '8-12', equipment: 'Barbell', notes: 'Keep chest up' },
      { name: 'Deadlift', sets: '3', reps: '5-8', equipment: 'Barbell', notes: 'Neutral spine throughout' },
      { name: 'Pull-ups', sets: '3', reps: '8-12', equipment: 'Bodyweight', notes: 'Full range of motion' },
      { name: 'Overhead Press', sets: '3', reps: '8-10', equipment: 'Barbell', notes: 'Brace core tight' }
    ],
    weight_loss: [
      { name: 'Kettlebell Swings', sets: '4', reps: '15-20', equipment: 'Kettlebell', notes: 'Hip hinge movement' },
      { name: 'Box Jumps', sets: '3', reps: '10-12', equipment: 'Box', notes: 'Land softly' },
      { name: 'Battle Ropes', sets: '3', reps: '30 sec', equipment: 'Ropes', notes: 'Maintain rhythm' },
      { name: 'Barbell Complex', sets: '3', reps: '6 each', equipment: 'Barbell', notes: 'No rest between movements' }
    ]
  },
  home: {
    muscle_gain: [
      { name: 'Push-ups', sets: '4', reps: '15-20', equipment: 'Bodyweight', notes: 'Chest to floor' },
      { name: 'Dumbbell Rows', sets: '4', reps: '10-15', equipment: 'Dumbbells', notes: 'Elbow close to body' },
      { name: 'Dumbbell Squats', sets: '4', reps: '12-15', equipment: 'Dumbbells', notes: 'Knees track over toes' },
      { name: 'Dumbbell Shoulder Press', sets: '3', reps: '10-12', equipment: 'Dumbbells', notes: 'Controlled tempo' }
    ],
    weight_loss: [
      { name: 'Burpees', sets: '5', reps: '10-15', equipment: 'Bodyweight', notes: 'Explosive movement' },
      { name: 'Mountain Climbers', sets: '4', reps: '30 sec', equipment: 'Bodyweight', notes: 'Keep hips level' },
      { name: 'Jump Squats', sets: '4', reps: '15', equipment: 'Bodyweight', notes: 'Land with soft knees' }
    ]
  },
  bodyweight: {
    muscle_gain: [
      { name: 'Push-ups', sets: '5', reps: '15-20', equipment: 'Bodyweight', notes: 'Various hand positions' },
      { name: 'Pull-ups', sets: '4', reps: '8-12', equipment: 'Bar', notes: 'Dead hang start' },
      { name: 'Pistol Squats', sets: '3', reps: '8 per leg', equipment: 'Bodyweight', notes: 'Use support if needed' },
      { name: 'Dips', sets: '3', reps: '10-15', equipment: 'Parallel bars', notes: 'Lean forward for chest' }
    ],
    weight_loss: [
      { name: 'Burpees', sets: '5', reps: '10-15', equipment: 'Bodyweight', notes: 'Max effort' },
      { name: 'High Knees', sets: '4', reps: '30 sec', equipment: 'Bodyweight', notes: 'Drive knees up' },
      { name: 'Plank to Push-up', sets: '3', reps: '10-12', equipment: 'Bodyweight', notes: 'Stable hips' }
    ]
  }
}

const FALLBACK_MEALS = {
  high_protein: [
    { name: 'Grilled Chicken Bowl', calories: 450, protein: 40, carbs: 35, fat: 12, description: 'With brown rice and steamed broccoli' },
    { name: 'Greek Yogurt Parfait', calories: 300, protein: 25, carbs: 28, fat: 6, description: 'With mixed berries and granola' },
    { name: 'Tuna Salad', calories: 350, protein: 35, carbs: 20, fat: 14, description: 'With whole grain crackers and avocado' },
    { name: 'Egg White Omelette', calories: 280, protein: 30, carbs: 8, fat: 10, description: 'With spinach, mushrooms, and feta' }
  ],
  low_cal: [
    { name: 'Veggie Omelette', calories: 250, protein: 20, carbs: 10, fat: 14, description: '3 eggs with spinach and peppers' },
    { name: 'Protein Smoothie', calories: 280, protein: 30, carbs: 25, fat: 5, description: 'Whey protein, banana, almond milk' },
    { name: 'Turkey Lettuce Wraps', calories: 220, protein: 25, carbs: 8, fat: 9, description: 'Ground turkey with lettuce and salsa' }
  ]
}

// ============================================================
// MAIN GEMINI API FUNCTION
// ============================================================
export const generateWithGemini = async (prompt, type = 'workout') => {
  // 1. Check if we are currently rate-limited
  if (isCooldownActive) {
    console.warn('🕒 Rate limit active - Skipping API call and using fallback');
    return useFallback(prompt, type);
  }

  if (!GEMINI_API_KEY) return useFallback(prompt, type);

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    // 2. Handle 429 specifically
    if (response.status === 429) {
      console.error('❌ 429: Quota exceeded. Activating 60s cooldown.');
      isCooldownActive = true;
      setTimeout(() => { isCooldownActive = false; }, 60000); // Reset after 1 minute
      return useFallback(prompt, type);
    }

    if (!response.ok) {
      const err = await response.json();
      console.error('❌ Gemini API error:', err?.error?.message || response.status);
      return useFallback(prompt, type);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return useFallback(prompt, type);

    const cleaned = text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    return cleaned;

  } catch (error) {
    console.error('❌ Gemini fetch failed:', error.message);
    return useFallback(prompt, type);
  }
}

// ============================================================
// SMART FALLBACK (Your exact original functionality)
// ============================================================
function useFallback(prompt, type) {
  if (type === 'workout') {
    const isHome = prompt.toLowerCase().includes('home');
    const isBodyweight = prompt.toLowerCase().includes('bodyweight');
    const isWeightLoss = prompt.toLowerCase().includes('weight loss') || prompt.toLowerCase().includes('lose weight');

    const equipment = isBodyweight ? 'bodyweight' : isHome ? 'home' : 'full_gym';
    const goal = isWeightLoss ? 'weight_loss' : 'muscle_gain';

    return JSON.stringify(FALLBACK_WORKOUTS[equipment][goal]);
  }

  if (type === 'meal') {
    const isHighProtein = prompt.toLowerCase().includes('protein');
    return JSON.stringify(isHighProtein ? FALLBACK_MEALS.high_protein : FALLBACK_MEALS.low_cal);
  }

  return null;
}

export default generateWithGemini;