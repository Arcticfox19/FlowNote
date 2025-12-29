
export interface FlowNoteEntry {
  id: string;
  content: string;
  createdAt: number;
}

export enum FlowState {
  IDLE = 'IDLE',
  WRITING = 'WRITING',
  STALLED = 'STALLED',
  CRITICAL = 'CRITICAL'
}
