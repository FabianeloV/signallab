import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { PageHeader } from '../molecules/PageHeader';
import { SearchInput } from '../atoms/SearchInput';
import { Button } from '../atoms/Button';
import { Tabs } from '../molecules/Tabs';
import { TheoremCard } from '../molecules/TheoremCard';
import { THEOREMS, THEOREM_FILTERS } from '../../data/theorems';
import styles from './ReportesTeoremas.module.css';

export function ReportesTeoremas() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return THEOREMS.filter((t) => {
      const matchesFilter = filter === 'todos' || t.group === filter;
      const matchesQuery =
        q === '' ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.label.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <>
      <PageHeader
        title="Reportes y Teoremas"
        subtitle="Conceptos fundamentales de Señales y Sistemas (Alan V. Oppenheim)."
        right={
          <>
            <div className={styles.search}>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Buscar teoremas, propiedades…"
              />
            </div>
            <Button icon={<Download size={16} />}>Descargar Compendio PDF</Button>
          </>
        }
      />

      <div className={styles.tabsRow}>
        <Tabs items={THEOREM_FILTERS} active={filter} onChange={setFilter} />
      </div>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((theorem) => (
            <TheoremCard
              key={theorem.id}
              theorem={theorem}
              onOpenLab={() => navigate('/laboratorio')}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          No hay conceptos que coincidan con la búsqueda. Prueba con otro
          término o cambia el filtro de categoría.
        </p>
      )}
    </>
  );
}
