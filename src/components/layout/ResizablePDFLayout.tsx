import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { 
  Maximize2, 
  Minimize2, 
  PanelLeftClose, 
  PanelLeftOpen,
  Settings,
  Download,
  Share2,
  Menu,
  MessageSquare,
  FileText,
  Languages,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResizablePDFLayoutProps {
  pdfViewer: React.ReactNode;
  chatInterface: React.ReactNode;
  translationPanel?: React.ReactNode;
  onShare?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export type ViewMode = 'split' | 'pdf-only' | 'chat-only' | 'fullscreen';

const ResizablePDFLayout: React.FC<ResizablePDFLayoutProps> = ({
  pdfViewer,
  chatInterface,
  translationPanel,
  onShare,
  onDownload,
  onDelete,
  className
}) => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'pdf-only' : 'split');
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'fullscreen') {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      setViewMode('split');
      setIsFullscreen(false);
    } else {
      setViewMode('fullscreen');
      setIsFullscreen(true);
    }
  }, [isFullscreen]);

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-screen bg-gradient-to-br from-background to-muted/20",
        isFullscreen && "fixed inset-0 z-50 bg-background",
        className
      )}>
        {/* Enhanced Header - Mobile/Desktop Responsive */}
        <header className="flex items-center justify-between p-3 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-base md:text-lg text-right">عارض PDF المطور</h1>
          </div>
          
          {isMobile ? (
            /* Mobile Header */
            <div className="flex items-center gap-2">
              {/* View Mode Toggle for Mobile */}
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'pdf-only' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleViewModeChange('pdf-only')}
                  className="h-9 w-9"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'chat-only' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleViewModeChange('chat-only')}
                  className="h-9 w-9"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                {translationPanel && (
                  <Button
                    variant={showTranslation && viewMode === 'chat-only' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => {
                      setShowTranslation(!showTranslation);
                      if (!showTranslation) setViewMode('chat-only');
                    }}
                    className="h-9 w-9"
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h2 className="text-lg font-semibold text-right">الخيارات</h2>
                      <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-right">وضع العرض</h3>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant={viewMode === 'pdf-only' ? 'default' : 'outline'}
                            onClick={() => {
                              handleViewModeChange('pdf-only');
                              setMobileMenuOpen(false);
                            }}
                            className="justify-start text-right h-10"
                          >
                            <FileText className="h-4 w-4 ml-2" />
                            PDF فقط
                          </Button>
                          <Button
                            variant={viewMode === 'chat-only' ? 'default' : 'outline'}
                            onClick={() => {
                              handleViewModeChange('chat-only');
                              setMobileMenuOpen(false);
                            }}
                            className="justify-start text-right h-10"
                          >
                            <MessageSquare className="h-4 w-4 ml-2" />
                            المحادثة فقط
                          </Button>
                        </div>
                      </div>
                      
                      {translationPanel && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-right">الترجمة</h3>
                          <Button
                            variant={showTranslation ? 'default' : 'outline'}
                            onClick={() => {
                              setShowTranslation(!showTranslation);
                              if (!showTranslation) setViewMode('chat-only');
                            }}
                            className="w-full justify-start text-right h-10"
                          >
                            <Languages className="h-4 w-4 ml-2" />
                            {showTranslation ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
                          </Button>
                        </div>
                      )}
                      
                      <div className="space-y-2 pt-4 border-t">
                        <h3 className="text-sm font-medium text-right">الإجراءات</h3>
                        {onShare && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              onShare();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-right h-10"
                          >
                            <Share2 className="h-4 w-4 ml-2" />
                            مشاركة PDF
                          </Button>
                        )}
                        {onDownload && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              onDownload();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-right h-10"
                          >
                            <Download className="h-4 w-4 ml-2" />
                            تحميل PDF
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              onDelete();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-right text-destructive h-10"
                          >
                            <PanelLeftClose className="h-4 w-4 ml-2" />
                            حذف PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            /* Desktop Header */
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                {/* View Mode Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'split' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('split')}
                    className="h-8"
                  >
                    العرض المقسم
                  </Button>
                  <Button
                    variant={viewMode === 'pdf-only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('pdf-only')}
                    className="h-8"
                  >
                    PDF فقط
                  </Button>
                  <Button
                    variant={viewMode === 'chat-only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('chat-only')}
                    className="h-8"
                  >
                    المحادثة فقط
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Translation Toggle */}
                {translationPanel && (
                  <Button
                    variant={showTranslation ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="h-8"
                  >
                    الترجمة
                  </Button>
                )}
                
                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Settings className="h-4 w-4 mr-2" />
                      الخيارات
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onShare && (
                      <DropdownMenuItem onClick={onShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        مشاركة PDF
                      </DropdownMenuItem>
                    )}
                    {onDownload && (
                      <DropdownMenuItem onClick={onDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        تحميل PDF
                      </DropdownMenuItem>
                    )}
                    {(onShare || onDownload) && onDelete && <DropdownMenuSeparator />}
                    {onDelete && (
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <PanelLeftClose className="h-4 w-4 mr-2" />
                        حذف PDF
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Fullscreen Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content - Mobile/Desktop Responsive */}
        <div className="flex-1 overflow-hidden">
          {(viewMode === 'pdf-only' || viewMode === 'fullscreen') && (
            <div className="h-full">
              {pdfViewer}
            </div>
          )}
          
          {viewMode === 'chat-only' && (
            <div className="h-full flex flex-col">
              {/* Mobile: Show translation panel above chat if enabled */}
              {isMobile && showTranslation && translationPanel && (
                <div className="h-1/2 border-b border-border/50">
                  {translationPanel}
                </div>
              )}
              <div className="flex-1 max-w-4xl mx-auto p-4 w-full">
                {/* Desktop: Show translation panel side by side */}
                {!isMobile && showTranslation && translationPanel ? (
                  <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={60} minSize={40}>
                      {chatInterface}
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={40} minSize={30}>
                      {translationPanel}
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ) : (
                  chatInterface
                )}
              </div>
            </div>
          )}
          
          {viewMode === 'split' && !isMobile && (
            <ResizablePanelGroup 
              direction="horizontal" 
              className="h-full"
            >
              {/* PDF Panel */}
              <ResizablePanel 
                defaultSize={showTranslation ? 40 : 60}
                minSize={30}
                className="relative"
              >
                {pdfViewer}
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Translation Panel (if enabled) */}
              {showTranslation && translationPanel && (
                <>
                  <ResizablePanel 
                    defaultSize={30}
                    minSize={20}
                    className="relative"
                  >
                    {translationPanel}
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                </>
              )}
              
              {/* Chat Panel */}
              <ResizablePanel 
                defaultSize={showTranslation ? 30 : 40}
                minSize={25}
                className="relative"
              >
                {chatInterface}
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
        
        {/* Status Bar - Mobile/Desktop Responsive */}
        {!isMobile && (
          <footer className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border/50 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>وضع العرض: {
                viewMode === 'split' ? 'مقسم' :
                viewMode === 'pdf-only' ? 'PDF فقط' :
                viewMode === 'chat-only' ? 'محادثة فقط' : 'ملء الشاشة'
              }</span>
              {showTranslation && <span>• الترجمة مفعلة</span>}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>متصل</span>
            </div>
          </footer>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ResizablePDFLayout;