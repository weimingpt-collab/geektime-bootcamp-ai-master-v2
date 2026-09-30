import type { Turn } from '../types/conversation'
import { TurnCard } from './TurnCard'

interface TurnListProps {
  turns: Turn[]
}

export function TurnList({ turns }: TurnListProps) {
  return (
    <div className="turn-list">
      {turns.map((turn) => (
        <TurnCard key={turn.turnIndex} turn={turn} />
      ))}
      <style>{`
        .turn-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }
      `}</style>
    </div>
  )
}
