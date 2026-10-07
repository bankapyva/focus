import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { AreaStat } from '../utils/statistics';
import { formatDuration } from '../utils/time';

interface AreaDistributionCardProps {
  areaStats: AreaStat[];
  totalSeconds: number;
  periodLabel: string;
}

export const AreaDistributionCard: React.FC<AreaDistributionCardProps> = ({
  areaStats,
  totalSeconds,
  periodLabel,
}) => {
  const activeAreas = areaStats.filter((a) => a.totalSeconds > 0);

  const chartData = activeAreas.map((a) => ({
    name: a.name,
    value: a.totalSeconds,
    color: a.color,
  }));

  return (
    <div className="stats-panel area-distribution-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">Розподіл за сферами</h2>
        <span className="stats-panel__period-tag">{periodLabel}</span>
      </div>

      {activeAreas.length === 0 ? (
        <div className="area-distribution-empty">
          Немає даних за обраний період
        </div>
      ) : (
        <div className="area-distribution-body">
          {/* Donut діаграма */}
          <div className="area-distribution-chart">
            <ResponsiveContainer width={195} height={195}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={66}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  pointerEvents="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Текст у центрі діаграми */}
            <div className="area-pie-center-label">
              <span className="area-pie-center-label__val">
                {formatDuration(totalSeconds)}
              </span>
            </div>
          </div>

          {/* Таблиця сфер */}
          <div className="area-distribution-table-wrap">
            <table className="area-table">
              <thead>
                <tr className="area-table__header-row">
                  <th className="area-table__th area-table__th--name">Сфера</th>
                  <th className="area-table__th area-table__th--hours">Час</th>
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
                      {formatDuration(item.totalSeconds)}
                    </td>
                    <td className="area-table__td area-table__td--percent">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaDistributionCard;