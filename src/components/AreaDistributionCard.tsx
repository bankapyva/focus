import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { AreaStat } from '../utils/statistics';
import { formatDuration } from '../utils/time';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t, lang } = useTranslation();
  const activeAreas = areaStats.filter((a) => a.totalSeconds > 0);

  const chartData = activeAreas.map((a) => ({
    name: a.name,
    value: a.totalSeconds,
    color: a.color,
  }));

  return (
    <div className="stats-panel area-distribution-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">{t('stats.dist.title')}</h2>
        <span className="stats-panel__period-tag">{periodLabel}</span>
      </div>

      {activeAreas.length === 0 ? (
        <div className="area-distribution-empty">
          {t('stats.dist.empty')}
        </div>
      ) : (
        <div className="area-distribution-body">
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

            <div className="area-pie-center-label">
              <span className="area-pie-center-label__val">
                {formatDuration(totalSeconds, lang)}
              </span>
            </div>
          </div>

          <div className="area-distribution-table-wrap">
            <table className="area-table">
              <thead>
                <tr className="area-table__header-row">
                  <th className="area-table__th area-table__th--name">{t('today.colArea')}</th>
                  <th className="area-table__th area-table__th--hours">{t('today.colTime')}</th>
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
                      {formatDuration(item.totalSeconds, lang)}
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