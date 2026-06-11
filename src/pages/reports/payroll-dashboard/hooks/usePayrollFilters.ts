import { useState, useMemo } from 'react';
import type { PayrollRow } from '../types';

export interface PayrollFilters {
  filterSucursal: string;
  filterConvenio: string;
  filterAntiguedad: string;
  filterSearch: string;
}

export interface PayrollFilterSetters {
  setFilterSucursal: (val: string) => void;
  setFilterConvenio: (val: string) => void;
  setFilterAntiguedad: (val: string) => void;
  setFilterSearch: (val: string) => void;
}

/**
 * Hook para manejar la lógica de filtrado en el dashboard administrativo.
 */
export const usePayrollFilters = (rows: PayrollRow[]) => {
  const [filterSucursal, setFilterSucursal] = useState<string>('');
  const [filterConvenio, setFilterConvenio] = useState<string>('');
  const [filterAntiguedad, setFilterAntiguedad] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  const filteredRows = useMemo<PayrollRow[]>(() => {
    return rows.filter((row: PayrollRow) => {
      const sucursal = String(row['Sucursal'] || '');
      const convenio = String(row['Convenio'] || '');
      const antiguedad = Number(row['Antigüedad (Años)'] || 0);
      
      const searchStr = Object.values(row)
        .filter(v => v !== null && v !== undefined)
        .join(' ')
        .toLowerCase();

      if (filterSucursal && sucursal !== filterSucursal) return false;
      if (filterConvenio && convenio !== filterConvenio) return false;
      
      if (filterAntiguedad) {
        const [min, max] = filterAntiguedad.split('-').map(Number);
        if (antiguedad < min || (max && antiguedad > max)) return false;
      }
      
      if (filterSearch && !searchStr.includes(filterSearch.toLowerCase())) return false;
      
      return true;
    });
  }, [rows, filterSucursal, filterConvenio, filterAntiguedad, filterSearch]);

  const resetFilters = () => {
    setFilterSucursal('');
    setFilterConvenio('');
    setFilterAntiguedad('');
    setFilterSearch('');
  };

  return {
    filters: { filterSucursal, filterConvenio, filterAntiguedad, filterSearch } as PayrollFilters,
    setters: { 
      setFilterSucursal, 
      setFilterConvenio, 
      setFilterAntiguedad, 
      setFilterSearch 
    } as PayrollFilterSetters,
    filteredRows,
    resetFilters
  };
};
