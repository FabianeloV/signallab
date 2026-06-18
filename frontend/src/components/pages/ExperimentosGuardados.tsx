import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../molecules/PageHeader';
import { SearchInput } from '../atoms/SearchInput';
import { Select } from '../atoms/Select';
import { ExperimentCard } from '../molecules/ExperimentCard';
import { EXPERIMENTS } from '../../data/experiments';
import type { Experiment } from '../../data/experiments';
import styles from './ExperimentosGuardados.module.css';

type TypeFilter = 'todos' | 'lab' | 'spectral';
type SortOrder = 'recientes' | 'nombre';

export function ExperimentosGuardados() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Experiment[]>(EXPERIMENTS);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos');
  const [sort, setSort] = useState<SortOrder>('recientes');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((e) => {
      const matchesType = typeFilter === 'todos' || e.type === typeFilter;
      const matchesQuery =
        q === '' ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.timeAgo.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
    if (sort === 'nombre') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }
    return filtered;
  }, [items, query, typeFilter, sort]);

  const handleDelete = (id: string) =>
    setItems((prev) => prev.filter((e) => e.id !== id));

  const handleLoad = (exp: Experiment) =>
    navigate(exp.type === 'lab' ? '/laboratorio' : '/analisis');

  return (
    <>
      <PageHeader
        title="Experimentos Guardados"
        subtitle="Gestiona y recarga tus señales LTI y análisis espectrales previos."
        right={
          <span className={styles.total}>
            {items.length} Experimentos Totales
          </span>
        }
      />

      <div className={styles.toolbar}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre, tipo o fecha…"
        />
        <div className={styles.filters}>
          <Select<TypeFilter>
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'todos', label: 'Todos los tipos' },
              { value: 'lab', label: 'Laboratorio LTI' },
              { value: 'spectral', label: 'Análisis Espectral' },
            ]}
          />
          <Select<SortOrder>
            value={sort}
            onChange={setSort}
            options={[
              { value: 'recientes', label: 'Más recientes' },
              { value: 'nombre', label: 'Por nombre' },
            ]}
          />
        </div>
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onLoad={() => handleLoad(exp)}
              onDelete={() => handleDelete(exp.id)}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          No hay experimentos que coincidan. Ajusta los filtros o crea uno
          nuevo desde el Laboratorio LTI.
        </p>
      )}
    </>
  );
}
