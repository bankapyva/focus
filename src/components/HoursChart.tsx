import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { Area } from '../types/Area';
import type { DayBarData } from '../utils/statistics';
import { CustomTooltip } from './CustomTooltip';

interface HoursChartProps {
  dailyChartData: DayBarData[];
  areas: Area[];
  periodLabel: string;
}

export const HoursChart: React.FC<HoursChartProps> = ({
  dailyChartData,
  areas,
  periodLabel,
}) => {
  // Перевіряємо, чи є хоч якась активність у вибраному періоді
  const hasData = dailyChartData.some((day) => day.totalHours > 0);

  return (
    <div className="stats-panel hours-chart-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">Графік за сферами</h2>
        <span className="stats-panel__period-tag">{periodLabel}</span>
      </div>

      {!hasData ? (
        <div className="hours-chart__empty">
          Немає даних для побудови графіка
        </div>
      ) : (
        <div className="hours-chart-container">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={dailyChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              {/* Легка горизонтальна сітка як на макеті */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255, 255, 255, 0.05)"
              />

              <XAxis
                dataKey="dateLabel"
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                content={<CustomTooltip areas={areas} />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              />

              {/* Стовпчики зі стеком по кожній сфері */}
              {areas.map((area, index) => (
                <Bar
                  key={area.id}
                  dataKey={area.id}
                  stackId="hoursStack"
                  fill={area.color}
                  radius={
                    index === areas.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HoursChart;