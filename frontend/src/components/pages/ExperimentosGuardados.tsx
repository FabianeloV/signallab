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

export function ExperimentosGuardados() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXPERIMENTS.filter((e) => {
      const matchesType = typeFilter === 'todos' || e.type === typeFilter;
      const matchesQuery =
        q === '' ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [query, typeFilter]);

  const handleLoad = (exp: Experiment) => {
    const state = { preset: exp.config, presetName: exp.title };
    navigate(exp.type === 'lab' ? '/laboratorio' : '/analisis', { state });
  };

  return (
    <>
      <PageHeader
        title="Experimentos de Ejemplo"
        subtitle="Carga escenarios de muestra que ilustran los teoremas en el Laboratorio LTI o el Análisis Espectral."
        right={
          <span className={styles.total}>
            {EXPERIMENTS.length} experimentos de ejemplo
          </span>
        }
      />

      <div className={styles.toolbar}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar por nombre o concepto…"
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
        </div>
      </div>

      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onLoad={() => handleLoad(exp)}
            />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>
          No hay experimentos que coincidan. Ajusta la búsqueda o el filtro de
          tipo.
        </p>
      )}
    </>
  );
}
