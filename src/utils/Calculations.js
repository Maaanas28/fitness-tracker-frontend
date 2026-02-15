// BMI Calculator
export const calculateBMI = (weight, height) => {
  // weight in kg, height in cm
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  return bmi.toFixed(1)
}

// BMI Category
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' }
  if (bmi < 25) return { category: 'Normal', color: 'text-lime-500' }
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-500' }
  return { category: 'Obese', color: 'text-red-500' }
}

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
export const calculateBMR = (weight, height, age, gender) => {
  // weight in kg, height in cm
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
export const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,        // Little or no exercise
    light: 1.375,          // Light exercise 1-3 days/week
    moderate: 1.55,        // Moderate exercise 3-5 days/week
    active: 1.725,         // Heavy exercise 6-7 days/week
    veryActive: 1.9        // Very heavy exercise, physical job
  }
  return Math.round(bmr * multipliers[activityLevel])
}

// Calculate calorie goals based on fitness goal
export const calculateCalorieGoals = (tdee, goal) => {
  const goals = {
    lose: {
      label: 'Weight Loss',
      calories: Math.round(tdee - 500),
      description: '500 calorie deficit for ~0.5kg loss per week'
    },
    maintain: {
      label: 'Maintain Weight',
      calories: Math.round(tdee),
      description: 'Maintain current weight'
    },
    gain: {
      label: 'Muscle Gain',
      calories: Math.round(tdee + 300),
      description: '300 calorie surplus for lean muscle gain'
    }
  }
  return goals[goal]
}

// Calculate macros (simplified)
export const calculateMacros = (calories, goal) => {
  let protein, carbs, fats
  
  if (goal === 'lose') {
    // High protein for weight loss
    protein = Math.round((calories * 0.35) / 4) // 35% protein
    fats = Math.round((calories * 0.25) / 9)    // 25% fats
    carbs = Math.round((calories * 0.40) / 4)   // 40% carbs
  } else if (goal === 'gain') {
    // Balanced for muscle gain
    protein = Math.round((calories * 0.30) / 4) // 30% protein
    fats = Math.round((calories * 0.25) / 9)    // 25% fats
    carbs = Math.round((calories * 0.45) / 4)   // 45% carbs
  } else {
    // Balanced for maintenance
    protein = Math.round((calories * 0.25) / 4) // 25% protein
    fats = Math.round((calories * 0.30) / 9)    // 30% fats
    carbs = Math.round((calories * 0.45) / 4)   // 45% carbs
  }
  
  return { protein, carbs, fats }
}