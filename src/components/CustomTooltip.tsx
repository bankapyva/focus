import React from 'react';
import type { Area } from '../types/Area';
import { useTranslation } from '../hooks/useTranslation';
import { getAreaName } from '../utils/areaHelper';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    dataKey: string;
    payload: {
      dateKey: string;
      dateLabel: string;
      totalHours: number;
      [key: string]: unknown;
    };
  }>;
  areas: Area[];
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  areas,
}) => {
  const { lang } = useTranslation();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const firstItem = payload[0].payload;
  const totalHours = firstItem.totalHours || 0;

  const activeAreasForDay = areas
    .map((area) => {
      const hours = Number(firstItem[area.id] || 0);
      return { area, hours };
    })
    .filter((item) => item.hours > 0);

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__header">
        <span className="chart-tooltip__date">{firstItem.dateLabel}</span>
        <strong className="chart-tooltip__total">{totalHours} год</strong>
      </div>

      {activeAreasForDay.length > 0 ? (
        <div className="chart-tooltip__list">
          {activeAreasForDay.map(({ area, hours }) => (
            <div key={area.id} className="chart-tooltip__item">
              <div className="chart-tooltip__item-left">
                <span
                  className="chart-tooltip__dot"
                  style={{ backgroundColor: area.color }}
                />
                <span>{getAreaName(area, lang)}</span>
              </div>
              <span className="chart-tooltip__hours">{hours} год</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="chart-tooltip__empty">0 год роботи</div>
      )}
    </div>
  );
};

export default CustomTooltip;