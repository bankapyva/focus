import React from 'react';
import type { AreaStat } from '../utils/statistics';
import { formatHours } from '../utils/time';

interface AreaTableProps {
  areaStats: AreaStat[];
  periodLabel: string;
}

export const AreaTable: React.FC<AreaTableProps> = ({ areaStats, periodLabel }) => {
  // Фільтруємо сфери, де був зафіксований час
  const activeAreas = areaStats.filter((a) => a.totalSeconds > 0);

  return (
    <div className="stats-panel area-table-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">Деталізація за сферами</h2>
        <span className="stats-panel__period-tag">{periodLabel}</span>
      </div>

      {activeAreas.length === 0 ? (
        <div className="area-table__empty">
          Немає записів за обраний період
        </div>
      ) : (
        <div className="area-table-wrapper">
          <table className="area-table">
            <thead>
              <tr className="area-table__header-row">
                <th className="area-table__th area-table__th--name">Сфера</th>
                <th className="area-table__th area-table__th--hours">Годин</th>
                <th className="area-table__th area-table__th--percent">%</th>
              </tr>
            </thead>
            <tbody>
              {activeAreas.map((item) => (
                <tr key={item.id} className="area-table__row">
                  <td className="area-table__td area-table__td--name">
                    <span
                      className="area-table__dot"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="area-table__name">{item.name}</span>
                  </td>
                  <td className="area-table__td area-table__td--hours">
                    {formatHours(item.totalSeconds)}
                  </td>
                  <td className="area-table__td area-table__td--percent">
                    {item.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AreaTable;