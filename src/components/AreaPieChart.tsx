import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { AreaStat } from '../utils/statistics';
import { formatHours } from '../utils/time';

interface AreaPieChartProps {
  areaStats: AreaStat[];
  totalSeconds: number;
  periodLabel: string;
}

export const AreaPieChart: React.FC<AreaPieChartProps> = ({
  areaStats,
  totalSeconds,
  periodLabel,
}) => {
  // Фільтруємо лише сфери, в яких був записаний час
  const activeAreas = areaStats.filter((a) => a.totalSeconds > 0);

  // Формуємо дані для Recharts
  const chartData = activeAreas.map((a) => ({
    name: a.name,
    value: a.totalSeconds,
    color: a.color,
  }));

  return (
    <div className="stats-panel area-pie-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">Розподіл за сферами</h2>
        <span className="stats-panel__period-tag">{periodLabel}</span>
      </div>

      {activeAreas.length === 0 ? (
        <div className="area-pie-panel__empty">
          Немає даних за обраний період
        </div>
      ) : (
        <div className="area-pie-content">
          {/* Ліва частина: кільцева діаграма з числом у центрі */}
          <div className="area-pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const sec = Number(data.value);
                      return (
                        <div className="chart-tooltip-box">
                          <span style={{ color: data.payload.color }}>
                            {data.name}
                          </span>
                          <strong>{formatHours(sec)} год</strong>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Число по центру кільця */}
            <div className="area-pie-center-label">
              <span className="area-pie-center-label__sub">Всього годин</span>
              <span className="area-pie-center-label__val">
                {formatHours(totalSeconds)}
              </span>
            </div>
          </div>

          {/* Права частина: список сфер */}
          <div className="area-pie-list">
            {activeAreas.map((item) => (
              <div key={item.id} className="area-pie-row">
                <div className="area-pie-row__left">
                  <span
                    className="area-pie-row__dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="area-pie-row__name">{item.name}</span>
                </div>

                <div className="area-pie-row__right">
                  <span className="area-pie-row__hours">
                    {formatHours(item.totalSeconds)}{' '}
                    <span className="area-pie-row__unit">год</span>
                  </span>
                  <span className="area-pie-row__percent">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaPieChart;