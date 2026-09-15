import { useState, useId } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 sao (Cơ bản)',
  2: '2 sao (Tiêu chuẩn)',
  3: '3 sao (Tiện nghi)',
  4: '4 sao (Cao cấp)',
  5: '5 sao (Sang trọng)'
};

export function StarRating({
  value = 5,
  onChange,
  readOnly = false,
  size = 20,
  showLabel = true,
  className = ''
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [justClicked, setJustClicked] = useState<number | null>(null);
  const instanceId = useId();

  const currentDisplay = hovered !== null ? hovered : value;

  const handleClick = (star: number) => {
    if (readOnly || !onChange) return;
    setJustClicked(star);
    setTimeout(() => setJustClicked(null), 350);
    onChange(star);
  };

  return (
    <div
      className={`star-rating-wrap ${readOnly ? 'read-only' : 'interactive'} ${className}`}
      onMouseLeave={() => !readOnly && setHovered(null)}
    >
      <div className="star-rating-group" role="radiogroup" aria-label="Đánh giá số sao khách sạn">
        {[1, 2, 3, 4, 5].map(star => {
          const isActive = star <= currentDisplay;
          const isDirectlyHovered = hovered === star;
          const isPopping = justClicked === star;

          return (
            <button
              key={star}
              type="button"
              id={`${instanceId}-star-${star}`}
              className={`star-btn ${isActive ? 'active' : 'inactive'} ${
                isDirectlyHovered ? 'hover-peak' : ''
              } ${isPopping ? 'pop-anim' : ''}`}
              disabled={readOnly}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              aria-label={`${star} sao`}
              title={`${star} sao - ${RATING_LABELS[star] || ''}`}
            >
              <Star
                size={size}
                className="star-icon"
                fill={isActive ? '#f59e0b' : 'transparent'}
                stroke={isActive ? '#d97706' : 'currentColor'}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="star-rating-text">
          {RATING_LABELS[currentDisplay] || `${currentDisplay} sao`}
        </span>
      )}
    </div>
  );
}
