interface SectionLabelProps {
  label: string;
  className?: string;
}

export default function SectionLabel({ label, className = '' }: SectionLabelProps) {
  return (
    <span className={`section-label ${className}`}>
      {label}
    </span>
  );
}
