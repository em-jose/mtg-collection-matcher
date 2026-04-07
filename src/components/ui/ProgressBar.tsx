interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export function ProgressBar({ percentage, className = '' }: ProgressBarProps) {
  const getColor = () => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full bg-gray-700 rounded-full h-3 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${getColor()}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}
