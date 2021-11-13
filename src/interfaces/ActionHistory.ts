export interface ActionHistory {
  description: string;
  undo(): void;
  redo(): void;
}
