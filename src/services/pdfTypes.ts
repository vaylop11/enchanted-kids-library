
export interface SupabasePDF {
  id: string;
  title: string;
  summary: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string;
  thumbnail?: string;
  filePath: string;
  fileUrl?: string;
}

export enum AnalysisStage {
  EXTRACTING = 'extracting',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  COMPLETE = 'complete',
  ERROR = 'error'
}
