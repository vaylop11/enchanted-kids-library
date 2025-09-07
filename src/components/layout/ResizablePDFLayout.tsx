import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
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
  Share2
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        {/* Enhanced Header */}
        <header className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">عارض PDF المطور</h1>
            
            {/* View Mode Controls */}
            <div className="flex items-center gap-2 ml-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'split' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('split')}
                    className="h-8"
                  >
                    العرض المقسم
                  </Button>
                </TooltipTrigger>
                <TooltipContent>عرض PDF والمحادثة معاً</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'pdf-only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('pdf-only')}
                    className="h-8"
                  >
                    PDF فقط
                  </Button>
                </TooltipTrigger>
                <TooltipContent>عرض PDF فقط</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'chat-only' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleViewModeChange('chat-only')}
                    className="h-8"
                  >
                    المحادثة فقط
                  </Button>
                </TooltipTrigger>
                <TooltipContent>عرض المحادثة فقط</TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Translation Toggle */}
            {translationPanel && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showTranslation ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="h-8"
                  >
                    الترجمة
                  </Button>
                </TooltipTrigger>
                <TooltipContent>إظهار/إخفاء لوحة الترجمة</TooltipContent>
              </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'pdf-only' && (
            <div className="h-full">
              {pdfViewer}
            </div>
          )}
          
          {viewMode === 'chat-only' && (
            <div className="h-full max-w-4xl mx-auto p-4">
              {chatInterface}
            </div>
          )}
          
          {viewMode === 'fullscreen' && (
            <div className="h-full">
              {pdfViewer}
            </div>
          )}
          
          {viewMode === 'split' && (
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
        
        {/* Status Bar */}
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
      </div>
    </TooltipProvider>
  );
};

export default ResizablePDFLayout;