import { useEffect } from 'react';
import { CageHistoryPanel } from '@/components/CageHistoryPanel';

export default function CageHistory() {
  useEffect(() => {
    document.title = 'Historique des Cages | Statistiques et Ventes';

    const desc = "Historique des cages: alimentation, ventes et FCR par période.";
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', desc);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + '/cage-history';
  }, []);

  return (
    <div className="container mx-auto p-6">
      <header className="sr-only">
        <h1>Historique des Cages - Statistiques d'Alimentation et Ventes</h1>
      </header>
      <CageHistoryPanel />
    </div>
  );
}
