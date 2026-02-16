// src/utils/gemini.js
const GEMINI_API_KEY = 'AIzaSyAEBkB3crMQBUMPiNixOF5hLPi16YWBGQc' // Fixed - removed "YO"

// Fallback workout plans when API fails
const FALLBACK_WORKOUTS = {
  full_gym: {
    muscle_gain: [
      { name: 'Barbell Bench Press', sets: '4', reps: '8-12', equipment: 'Barbell' },
      { name: 'Barbell Squat', sets: '4', reps: '8-12', equipment: 'Barbell' },
      { name: 'Deadlift', sets: '3', reps: '5-8', equipment: 'Barbell' },
      { name: 'Pull-ups', sets: '3', reps: '8-12', equipment: 'Bodyweight' }
    ],
    weight_loss: [
      { name: 'Kettlebell Swings', sets: '4', reps: '15-20', equipment: 'Kettlebell' },
      { name: 'Battle Ropes', sets: '3', reps: '30 sec', equipment: 'Ropes' },
      { name: 'Box Jumps', sets: '3', reps: '10-12', equipment: 'Box' }
    ]
  },
  home: {
    muscle_gain: [
      { name: 'Push-ups', sets: '4', reps: '15-20', equipment: 'Bodyweight' },
      { name: 'Dumbbell Rows', sets: '4', reps: '10-15', equipment: 'Dumbbells' },
      { name: 'Dumbbell Squats', sets: '4', reps: '12-15', equipment: 'Dumbbells' }
    ],
    weight_loss: [
      { name: 'Burpees', sets: '5', reps: '10-15', equipment: 'Bodyweight' },
      { name: 'Mountain Climbers', sets: '4', reps: '30 sec', equipment: 'Bodyweight' },
      { name: 'Jumping Jacks', sets: '4', reps: '30 sec', equipment: 'Bodyweight' }
    ]
  },
  bodyweight: {
    muscle_gain: [
      { name: 'Push-ups', sets: '4', reps: '15-20', equipment: 'Bodyweight' },
      { name: 'Pull-ups (if available)', sets: '4', reps: '8-12', equipment: 'Bar' },
      { name: 'Bodyweight Squats', sets: '4', reps: '20-25', equipment: 'Bodyweight' }
    ],
    weight_loss: [
      { name: 'Burpees', sets: '5', reps: '10-15', equipment: 'Bodyweight' },
      { name: 'High Knees', sets: '4', reps: '30 sec', equipment: 'Bodyweight' },
      { name: 'Plank to Push-up', sets: '3', reps: '10-12', equipment: 'Bodyweight' }
    ]
  }
}

// Fallback meals when API fails
const FALLBACK_MEALS = {
  high_protein: [
    { name: 'Grilled Chicken Bowl', calories: 450, protein: 40, description: 'With brown rice and veggies' },
    { name: 'Greek Yogurt Parfait', calories: 300, protein: 25, description: 'With berries and granola' },
    { name: 'Tuna Salad', calories: 350, protein: 35, description: 'With whole grain crackers' }
  ],
  low_cal: [
    { name: 'Veggie Omelette', calories: 250, protein: 20, description: '3 eggs with spinach' },
    { name: 'Protein Smoothie', calories: 280, protein: 30, description: 'Whey, banana, almond milk' },
    { name: 'Turkey Wrap', calories: 320, protein: 28, description: 'With lettuce and tomato' }
  ]
}

export const generateWithGemini = async (prompt, type = 'workout') => {
  console.log('Calling Gemini with prompt:', prompt)
  
  // Return fallback data based on type
  if (type === 'workout') {
    // Parse prompt to determine equipment and goal
    const isHome = prompt.includes('home workout')
    const isBodyweight = prompt.includes('bodyweight only')
    const isWeightLoss = prompt.includes('lose weight')
    
    let equipment = 'full_gym'
    if (isHome) equipment = 'home'
    if (isBodyweight) equipment = 'bodyweight'
    
    let goal = 'muscle_gain'
    if (isWeightLoss) goal = 'weight_loss'
    
    return JSON.stringify(FALLBACK_WORKOUTS[equipment][goal])
  }
  
  if (type === 'meal') {
    const isHighProtein = prompt.includes('protein')
    return JSON.stringify(isHighProtein ? FALLBACK_MEALS.high_protein : FALLBACK_MEALS.low_cal)
  }
  
  return null
}