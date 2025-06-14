
interface CachedTranslation {
  text: string;
  targetLanguage: string;
  translatedText: string;
  timestamp: number;
}

interface PageTranslation {
  [pageNumber: number]: {
    [language: string]: CachedTranslation;
  };
}

class TranslationCacheService {
  private cache: Map<string, PageTranslation> = new Map();
  private readonly CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

  // Generate cache key for PDF
  private getCacheKey(pdfId: string): string {
    return `pdf_${pdfId}`;
  }

  // Store translation in cache
  storeTranslation(
    pdfId: string,
    pageNumber: number,
    originalText: string,
    targetLanguage: string,
    translatedText: string
  ): void {
    const cacheKey = this.getCacheKey(pdfId);
    
    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, {});
    }

    const pdfCache = this.cache.get(cacheKey)!;
    
    if (!pdfCache[pageNumber]) {
      pdfCache[pageNumber] = {};
    }

    pdfCache[pageNumber][targetLanguage] = {
      text: originalText,
      targetLanguage,
      translatedText,
      timestamp: Date.now()
    };
  }

  // Get cached translation
  getCachedTranslation(
    pdfId: string,
    pageNumber: number,
    targetLanguage: string
  ): string | null {
    const cacheKey = this.getCacheKey(pdfId);
    const pdfCache = this.cache.get(cacheKey);

    if (!pdfCache || !pdfCache[pageNumber] || !pdfCache[pageNumber][targetLanguage]) {
      return null;
    }

    const cached = pdfCache[pageNumber][targetLanguage];
    
    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_EXPIRY) {
      delete pdfCache[pageNumber][targetLanguage];
      return null;
    }

    return cached.translatedText;
  }

  // Check if translation is cached
  hasTranslation(pdfId: string, pageNumber: number, targetLanguage: string): boolean {
    return this.getCachedTranslation(pdfId, pageNumber, targetLanguage) !== null;
  }

  // Get all cached pages for a language
  getCachedPages(pdfId: string, targetLanguage: string): number[] {
    const cacheKey = this.getCacheKey(pdfId);
    const pdfCache = this.cache.get(cacheKey);

    if (!pdfCache) return [];

    return Object.keys(pdfCache)
      .map(page => parseInt(page))
      .filter(pageNum => this.hasTranslation(pdfId, pageNum, targetLanguage));
  }

  // Clear cache for specific PDF
  clearPdfCache(pdfId: string): void {
    const cacheKey = this.getCacheKey(pdfId);
    this.cache.delete(cacheKey);
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
  }
}

export const translationCache = new TranslationCacheService();
