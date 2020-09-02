export interface RootProps {
  id: number;
  name: string;
  description: string;
  jobName: string;
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
