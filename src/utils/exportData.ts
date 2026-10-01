import type { Area } from '../types/Area';
import type { Session } from '../types/Session';
import type { Settings } from '../types/Settings';

export interface ExportPayload {
  version: string;
  exportedAt: string;
  areas: Area[];
  sessions: Session[];
  settings: Settings;
}

export function exportDataAsJSON(payload: {
  areas: Area[];
  sessions: Session[];
  settings: Settings;
}) {
  const data: ExportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ...payload,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `focustime-backup-${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}