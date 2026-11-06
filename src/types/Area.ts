export interface Area {
  id: string;
  name: string | { uk: string; en: string }; // Змінили тип name
  color: string;
}