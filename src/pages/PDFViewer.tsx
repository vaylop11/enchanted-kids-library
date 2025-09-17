import {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Component,
  ReactNode,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "react-error-boundary";

// ================== State & Reducer ==================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface PDFState {
  pdf: string | null;
  loading: boolean;
  pdfError: string | null;
  chatMessages: ChatMessage[];
}

enum PDFViewerActionType {
  SET_LOADING = "SET_LOADING",
  SET_PDF = "SET_PDF",
  SET_ERROR = "SET_ERROR",
  RESET_STATE = "RESET_STATE",
  ADD_CHAT_MESSAGE = "ADD_CHAT_MESSAGE",
  SET_MESSAGES = "SET_MESSAGES",
}

type PDFViewerAction =
  | { type: PDFViewerActionType.SET_LOADING }
  | { type: PDFViewerActionType.SET_PDF; payload: string }
  | { type: PDFViewerActionType.SET_ERROR; payload: string }
  | { type: PDFViewerActionType.RESET_STATE }
  | { type: PDFViewerActionType.ADD_CHAT_MESSAGE; payload: ChatMessage }
  | { type: PDFViewerActionType.SET_MESSAGES; payload: ChatMessage[] };

const initialState: PDFState = {
  pdf: null,
  loading: true,
  pdfError: null,
  chatMessages: [],
};

function pdfReducer(state: PDFState, action: PDFViewerAction): PDFState {
  switch (action.type) {
    case PDFViewerActionType.SET_LOADING:
      return { ...state, loading: true, pdfError: null };
    case PDFViewerActionType.SET_PDF:
      return { ...state, pdf: action.payload, loading: false };
    case PDFViewerActionType.SET_ERROR:
      return { ...state, pdfError: action.payload, loading: false };
    case PDFViewerActionType.RESET_STATE:
      return initialState;
    case PDFViewerActionType.ADD_CHAT_MESSAGE:
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case PDFViewerActionType.SET_MESSAGES:
      return { ...state, chatMessages: action.payload };
    default:
      return state;
  }
}

// ================== Error Fallback ==================

class ErrorFallback extends Component<{
  error: Error;
  resetErrorBoundary: () => void;
}> {
  render(): ReactNode {
    const { error, resetErrorBoundary } = this.props;
    return (
      <div
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-red-50 text-red-900"
      >
        <AlertTriangle className="w-12 h-12" />
        <h2 className="text-2xl font-bold">Something went wrong:</h2>
        <pre className="whitespace-pre-wrap">{error.message}</pre>
        <Button variant="outline" onClick={resetErrorBoundary}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }
}

// ================== Loading UI ==================

const LoadingComponent = ({ language }: { language: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <ArrowLeft className="h-5 w-5" />
        <span className="font-medium">
          {language === "ar" ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}
        </span>
      </div>
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري تحميل الملف..." : "Loading document..."}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// ================== Main Component ==================

export default function PDFViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(pdfReducer, initialState);

  const pdfRef = useRef<HTMLIFrameElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // -------- Fetch PDF --------
  const fetchPDF = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // إلغاء أي تحميل قديم
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      dispatch({ type: PDFViewerActionType.SET_LOADING });

      // simulate fetch (replace with real API)
      setTimeout(() => {
        if (!id) {
          dispatch({
            type: PDFViewerActionType.SET_ERROR,
            payload: "No document ID provided",
          });
          return;
        }

        if (!controller.signal.aborted) {
          dispatch({
            type: PDFViewerActionType.SET_PDF,
            payload: `/api/pdf/${id}`,
          });
        }
      }, 1000);
    } catch (err) {
      if (!controller.signal.aborted) {
        dispatch({
          type: PDFViewerActionType.SET_ERROR,
          payload: (err as Error).message,
        });
      }
    }
  }, [id]);

  useEffect(() => {
    fetchPDF();
    return () => abortControllerRef.current?.abort();
  }, [fetchPDF]);

  // -------- Scroll Always to Bottom --------
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [state.chatMessages]);

  // -------- Navigation --------
  const handleGoBack = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // -------- Optimistic Chat --------
  const addChatMessage = useCallback(
    async (message: ChatMessage) => {
      // Optimistic UI
      dispatch({
        type: PDFViewerActionType.ADD_CHAT_MESSAGE,
        payload: message,
      });

      try {
        // simulate save (localStorage / supabase)
        await new Promise((res) => setTimeout(res, 200));
      } catch {
        toast.error(language === "ar" ? "فشل الحفظ" : "Save failed");
      }
    },
    [language]
  );

  // -------- Memoized PDF Frame --------
  const iframeMemo = useMemo(
    () =>
      state.pdf && (
        <iframe
          ref={pdfRef}
          src={state.pdf}
          className="w-full h-full rounded-lg border"
          title="PDF Viewer"
        />
      ),
    [state.pdf]
  );

  // -------- Loading & Error States --------
  if (state.loading) return <LoadingComponent language={language} />;

  if (state.pdfError || !state.pdf) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "العودة" : "Back"}
            </Button>
            <Button variant="outline" onClick={fetchPDF} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {language === "ar" ? "إعادة المحاولة" : "Retry"}
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center flex-col gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <p className="text-center text-muted-foreground max-w-md">
              {language === "ar"
                ? "حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى."
                : "An error occurred while loading the document. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------- Main UI --------
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => dispatch({ type: PDFViewerActionType.RESET_STATE })}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Button variant="ghost" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {language === "ar" ? "العودة" : "Back"}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  pdfRef.current?.contentWindow?.location.reload();
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {language === "ar" ? "تحديث" : "Refresh"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (state.pdf) {
                    navigator.clipboard.writeText(
                      window.location.origin + state.pdf
                    );
                    toast.success(
                      language === "ar" ? "تم نسخ الرابط" : "Link copied"
                    );
                  }
                }}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {language === "ar" ? "نسخ الرابط" : "Copy Link"}
              </Button>
            </div>
          </div>

          {/* Scrollable Chat + PDF */}
          <div
            ref={scrollContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-4"
          >
            {iframeMemo}
            {state.chatMessages.map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-lg ${
                  m.role === "user"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
export default PDFViewer;
