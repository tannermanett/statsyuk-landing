interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Optional absolutely positioned background element. Rendered under content. */
  background?: React.ReactNode;
}

export default function Section({
  id,
  title,
  subtitle,
  description,
  children,
  className,
  background,
}: SectionProps) {
  const sectionId = title ? title.toLowerCase().replace(/\s+/g, "-") : id;
  return (
    <section id={id || sectionId}>
      <div className={className}>
        <div className="relative container mx-auto px-4 py-16 max-w-7xl">
          {background && (
            <div className="absolute inset-0 z-0">{background}</div>
          )}
          <div className="relative z-10">
            <div className="text-center space-y-4 pb-6 mx-auto">
            {title && (
              <h2 className="text-sm text-primary font-mono font-medium tracking-wider uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <h3 className="mx-auto mt-4 max-w-xs text-3xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl">
                {subtitle}
              </h3>
            )}
            {description && (
              <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
