import { ContentCard } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import type { ContentMeta } from "@/lib/types";

interface RelatedSectionProps {
  items: ContentMeta[];
  title?: string;
  eyebrow?: string;
}

export function RelatedSection({
  items,
  title = "Contenus similaires",
  eyebrow = "Continuer",
}: RelatedSectionProps) {
  if (!items.length) return null;

  return (
    <Section eyebrow={eyebrow} title={title} bg="neutral" containerSize="lg">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ContentCard key={item.slug} item={item} />
        ))}
      </div>
    </Section>
  );
}
