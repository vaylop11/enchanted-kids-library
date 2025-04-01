
import { PDF } from '@/components/PDFCard';

// This is just mock data for development/testing
export const pdfs: PDF[] = [
  {
    id: '1',
    title: 'Sample PDF 1',
    summary: 'This is a sample PDF for testing',
    uploadDate: '2025-04-01',
    pageCount: 10,
    fileSize: '1.2 MB',
    filePath: '/sample/path1.pdf'
  },
  {
    id: '2',
    title: 'Sample PDF 2',
    summary: 'Another sample PDF for testing',
    uploadDate: '2025-04-02',
    pageCount: 5,
    fileSize: '2.3 MB',
    filePath: '/sample/path2.pdf'
  },
  {
    id: '3',
    title: 'Sample PDF 3',
    summary: 'Yet another sample PDF',
    uploadDate: '2025-04-03',
    pageCount: 15,
    fileSize: '3.7 MB',
    filePath: '/sample/path3.pdf'
  },
  {
    id: '4',
    title: 'Sample PDF 4',
    summary: 'The fourth sample PDF',
    uploadDate: '2025-04-04',
    pageCount: 8,
    fileSize: '1.8 MB',
    filePath: '/sample/path4.pdf'
  }
];
