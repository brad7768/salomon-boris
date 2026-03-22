import { cn } from "@/lib/utils";

interface ProseBodyProps {
  html: string;
  /** Applique une police monospace sur les blocs <pre> (tablatures) */
  mono?: boolean;
  className?: string;
}

/**
 * Rend le HTML généré par remark avec les styles typographiques du design system.
 * Passe `mono` pour les tablatures afin d'afficher la notation en chasse fixe.
 */
export function ProseBody({ html, mono = false, className }: ProseBodyProps) {
  return (
    <div
      className={cn(
        // Base prose
        "prose prose-lg max-w-none",
        // Headings
        "prose-headings:font-display prose-headings:text-primary prose-headings:font-bold",
        "prose-h2:text-2xl prose-h3:text-xl",
        // Body
        "prose-p:text-text prose-p:leading-relaxed",
        // Links
        "prose-a:text-primary prose-a:font-medium prose-a:underline-offset-2",
        "hover:prose-a:no-underline",
        // Bold / italic
        "prose-strong:text-text prose-strong:font-semibold",
        // Blockquote
        "prose-blockquote:border-l-primary prose-blockquote:text-text-secondary",
        "prose-blockquote:not-italic",
        // Lists
        "prose-ul:text-text prose-ol:text-text",
        "prose-li:my-0.5",
        // Tables
        "prose-table:text-sm prose-th:text-primary prose-th:font-semibold",
        "prose-td:align-middle",
        // Code
        "prose-code:text-primary prose-code:bg-primary/8 prose-code:px-1.5",
        "prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal",
        "prose-code:before:content-none prose-code:after:content-none",
        // Pre (blocs de code / tablatures)
        "prose-pre:bg-[#0d0d1a] prose-pre:text-[#e8e8f0] prose-pre:rounded-2xl",
        "prose-pre:shadow-inner prose-pre:overflow-x-auto",
        mono && "prose-pre:font-mono prose-pre:text-sm prose-pre:leading-relaxed",
        // Images
        "prose-img:rounded-xl prose-img:shadow-sm",
        // HR
        "prose-hr:border-background-neutral",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
