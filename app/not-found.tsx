import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center">
      <Container size="sm" className="py-20 text-center">
        <p className="text-7xl mb-6">🎸</p>
        <h1 className="font-display text-5xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-semibold text-text mb-3">Page introuvable</h2>
        <p className="text-text-secondary mb-8">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/" variant="primary">Retour à l&apos;accueil</Button>
          <Button href="/recherche" variant="outline">Rechercher</Button>
        </div>
      </Container>
    </div>
  );
}
