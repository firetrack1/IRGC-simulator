import { useEffect, useRef } from 'react';
import { useGameStore } from '../state/gameStore';

export default function EventTicker() {
  const eventLog = useGameStore((s) => s.eventLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  return (
    <div className="event-ticker" ref={scrollRef}>
      {eventLog.map((entry, i) => (
        <div key={i} className={`event-entry event-${entry.tone}`}>
          <span className="event-turn">T{entry.turn}</span>
          <span className="event-headline">{entry.headline}</span>
          <span className="event-detail">{entry.detail}</span>
        </div>
      ))}
    </div>
  );
}
