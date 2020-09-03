export interface RootProps {
  id: number;
  name: string;
  description: string;
  jobName: string;
  status: number;
  categoryId: number;
  contents: Segment[];
}

export interface Segment {
  id: number;
  speaker: string;
  startOffset: number;
  endOffset: number;
  content: string;
}

export interface createNoteResponse {
  id: string;
  name: string;
  description: string;
  recordUrl: string;
  jobName: string;
  categoryId: number;
}