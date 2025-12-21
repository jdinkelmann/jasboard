export interface Exercise {
  name: string;
  reps?: string;
  duration?: string;
  sets?: string;
  notes?: string;
}

export interface Workout {
  id: string;
  date: string; // ISO date
  title: string;
  description: string;
  imageUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  type: 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'mixed';
  duration: number; // minutes
  exercises: Exercise[];
  warmup?: string;
  cooldown?: string;
  source: 'darebee';
  sourceUrl: string;
}

export interface UserWorkoutStatus {
  userId: string;
  workoutId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  streak: number;
}

export interface WorkoutUser {
  id: string;
  name: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTypes?: string[]; // ['strength', 'cardio', 'flexibility']
}
