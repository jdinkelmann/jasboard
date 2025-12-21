'use client';

import { useEffect, useState } from 'react';

interface Exercise {
  name: string;
  reps?: string;
  duration?: string;
}

interface Workout {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  imageUrl?: string;
}

interface UserStatus {
  userId: string;
  completed: boolean;
  streak: number;
}

interface WodData {
  workout: Workout | null;
  userStatuses: UserStatus[];
}

export default function WoD() {
  const [data, setData] = useState<WodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWod = async () => {
      try {
        const response = await fetch('/api/wod');
        const wodData = await response.json();
        setData(wodData);

        // Auto-select first user
        if (wodData.userStatuses && wodData.userStatuses.length > 0) {
          setSelectedUserId(wodData.userStatuses[0].userId);
        }
      } catch (error) {
        console.error('Failed to fetch WOD:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWod();

    // Refresh once daily (24 hours)
    const interval = setInterval(fetchWod, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCompleteWorkout = async (userId: string) => {
    try {
      const response = await fetch('/api/wod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          workoutId: data?.workout?.id,
          completed: true,
        }),
      });

      if (response.ok) {
        // Update local state
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            userStatuses: prev.userStatuses.map(status =>
              status.userId === userId
                ? { ...status, completed: true, streak: status.streak + 1 }
                : status
            ),
          };
        });
      }
    } catch (error) {
      console.error('Failed to mark workout complete:', error);
    }
  };

  if (loading) {
    return (
      <div
        className="h-full p-6 rounded-lg animate-pulse"
        style={{
          background: 'var(--theme-wod-bg)',
          opacity: 'var(--theme-widget-opacity)',
          backdropFilter: 'var(--theme-backdrop-blur)',
        }}
      >
        <div className="h-8 bg-gray-600/30 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-600/30 rounded w-1/2" />
      </div>
    );
  }

  if (!data?.workout) {
    return (
      <div
        className="h-full p-6 rounded-lg flex items-center justify-center"
        style={{
          background: 'var(--theme-wod-bg)',
          color: 'var(--theme-wod-text)',
          opacity: 'var(--theme-widget-opacity)',
          backdropFilter: 'var(--theme-backdrop-blur)',
          borderRadius: 'var(--theme-border-radius)',
        }}
      >
        <div className="text-center">
          <p className="text-lg opacity-70">No workout configured</p>
          <p className="text-sm opacity-50 mt-2">Add users in admin panel</p>
        </div>
      </div>
    );
  }

  const currentUserStatus = data.userStatuses.find(s => s.userId === selectedUserId);

  return (
    <div
      className="h-full p-6 rounded-lg overflow-y-auto"
      style={{
        background: 'var(--theme-wod-bg)',
        color: 'var(--theme-wod-text)',
        opacity: 'var(--theme-widget-opacity)',
        backdropFilter: 'var(--theme-backdrop-blur)',
        borderRadius: 'var(--theme-border-radius)',
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold">{data.workout.title}</h2>
          <p className="text-sm opacity-70 mt-1">{data.workout.description}</p>
        </div>

        {/* User selector if multiple users */}
        {data.userStatuses.length > 1 && (
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-3 py-1 rounded bg-black/20 text-sm"
          >
            {data.userStatuses.map(status => (
              <option key={status.userId} value={status.userId}>
                User {status.userId}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Workout image */}
      {data.workout.imageUrl && (
        <img
          src={data.workout.imageUrl}
          alt={data.workout.title}
          className="w-full h-32 object-cover rounded mb-4"
        />
      )}

      {/* Exercises */}
      <div className="space-y-2 mb-4">
        {data.workout.exercises.map((exercise, idx) => (
          <div
            key={idx}
            className="flex items-baseline gap-2 py-2 border-b border-white/10"
          >
            <span className="font-semibold">{exercise.name}</span>
            <span className="text-sm opacity-70">
              {exercise.reps || exercise.duration}
            </span>
          </div>
        ))}
      </div>

      {/* Completion status */}
      {currentUserStatus && (
        <div className="mt-auto pt-4 border-t border-white/10">
          {currentUserStatus.completed ? (
            <div className="text-center">
              <div className="text-3xl mb-2">✓</div>
              <p className="font-semibold">Completed!</p>
              {currentUserStatus.streak > 0 && (
                <p className="text-sm opacity-70 mt-1">
                  {currentUserStatus.streak} day streak 🔥
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleCompleteWorkout(currentUserStatus.userId)}
              className="w-full py-3 rounded font-semibold transition-colors"
              style={{
                background: 'var(--theme-wod-accent)',
                color: 'white',
              }}
            >
              Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
