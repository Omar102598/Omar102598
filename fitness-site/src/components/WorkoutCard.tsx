import { motion } from 'framer-motion';
import { Dumbbell, Clock, Target, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Workout } from '../types';

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <motion.div
      className="tool-card workout-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tool-card-header workout-header">
        <Dumbbell size={20} />
        <h3>{workout.title}</h3>
      </div>

      <div className="workout-meta">
        <span className="workout-meta-item">
          <Target size={14} /> {workout.goal}
        </span>
        <span className="workout-meta-item">
          <Flame size={14} /> {workout.difficulty}
        </span>
        <span className="workout-meta-item">
          <Clock size={14} /> {workout.durationMinutes} min
        </span>
      </div>

      <div className="workout-tags">
        {workout.muscleGroups.map((mg) => (
          <span className="workout-tag" key={mg}>{mg}</span>
        ))}
      </div>

      {workout.warmup && workout.warmup.length > 0 && (
        <div className="workout-phase">
          <h4>🔥 Warm-Up</h4>
          <ul>
            {workout.warmup.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {workout.sections.map((section, sIdx) => (
        <div className="workout-section" key={sIdx}>
          <button
            className="workout-section-toggle"
            onClick={() => toggleSection(sIdx)}
          >
            <h4>{section.name}</h4>
            {expandedSections.has(sIdx) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedSections.has(sIdx) && (
            <div className="workout-exercises">
              {section.exercises.map((ex, eIdx) => (
                <div className="workout-exercise" key={eIdx}>
                  <div className="exercise-name">{ex.name}</div>
                  <div className="exercise-details">
                    <span>{ex.sets} sets × {ex.reps}</span>
                    <span className="exercise-rest">Rest: {ex.restSeconds}s</span>
                  </div>
                  {ex.notes && <div className="exercise-notes">{ex.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {workout.cooldown && workout.cooldown.length > 0 && (
        <div className="workout-phase">
          <h4>❄️ Cool-Down</h4>
          <ul>
            {workout.cooldown.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {workout.tips && workout.tips.length > 0 && (
        <div className="workout-tips">
          <h4>💡 Tips</h4>
          <ul>
            {workout.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
