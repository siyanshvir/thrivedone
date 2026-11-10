import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, X, Sparkles, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BOT_NAME = "Flo AI";
const BOT_AVATAR_URL = "/FloBro.png";

type ChatApiErrorPayload = {
  error?: string;
  error_code?: string;
  request_id?: string;
  status?: number;
  upstream_status?: number | null;
};

type Source = {
  title: string;
  url: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

type PageContext = {
  path: string;
  url: string;
  title: string;
  excerpt: string;
};

export function ChatbotWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi, I'm Flo — nice to meet you! I'm here to answer your questions and concerns. Type away!",
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  const isProductManagementPage = location.pathname === "/product-management";
  const isTeamLoginPage = location.pathname === "/login";
  const isCheckoutProcessingPage = location.pathname === "/checkout-processing";

  // Check if mobile
  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || width < 768);
      setIsLaptop(width >= 768 && width < 1280);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const formatMessage = (content: string) => {
    // Very basic markdown-like formatter
    return content.split('\n').map((line, i) => {
      let formattedLine = line;

      // Handle bold
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Handle bullet points at start of line
      if (line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 list-disc mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.trim().substring(2) }} />
        );
      }

      // Handle headings
      if (line.trim().startsWith('## ')) {
        return (
          <h4 key={i} className="font-bold text-base mt-2 mb-1" dangerouslySetInnerHTML={{ __html: formattedLine.trim().substring(3) }} />
        );
      }

      if (!line.trim()) return <div key={i} className="h-2" />;

      return (
        <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  // Position logic
  const anchorClass = useMemo(() => {
    return "bottom-6 left-4";
  }, []);

  // Visibility logic
  useEffect(() => {
    if (isProductManagementPage || isTeamLoginPage || isCheckoutProcessingPage) {
      setIsVisible(false);
      setIsOpen(false);
      return;
    }

    setIsVisible(true);
  }, [isProductManagementPage, isTeamLoginPage, isCheckoutProcessingPage]);

  const getPageContext = (): PageContext => {
    const title = document?.title || "";
    const url = window?.location?.href || "";
    const path = location.pathname;

    const root =
      (document.querySelector("main") ||
        document.querySelector("#root") ||
        document.body) as HTMLElement | null;

    let rawText = "";
    if (root) {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = (node as Node).parentElement as HTMLElement | null;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.closest('[data-chatbot-widget="true"]')) return NodeFilter.FILTER_REJECT;
            if (parent.closest('script, style, noscript')) return NodeFilter.FILTER_REJECT;
            const txt = String(node.textContent || "").trim();
            if (!txt) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        } as NodeFilter
      );

      const parts: string[] = [];
      let cur: Node | null = walker.nextNode();
      while (cur) {
        parts.push(String(cur.textContent || "").trim());
        if (parts.join(" ").length > 3000) break;
        cur = walker.nextNode();
      }
      rawText = parts.join(" ");
    }

    const excerpt = rawText.replace(/\s+/g, " ").trim().slice(0, 1200);

    return {
      path,
      url,
      title,
      excerpt,
    };
  };

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const send = async (text?: string) => {
    const message = text || input.trim();
    if (!message || isLoading) return;

    const newHistory = [...messages, { role: "user", content: message } as Message];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversation_history: newHistory.slice(-10),
          page_context: getPageContext(),
        }),
        signal: controller.signal,
      });

      window.clearTimeout(timeout);

      if (!resp.ok) {
        let payload: ChatApiErrorPayload | null = null;
        try {
          payload = (await resp.json()) as ChatApiErrorPayload;
        } catch {
          payload = null;
        }

        const requestId = resp.headers.get("X-Request-Id") || payload?.request_id;
        const errorCode = payload?.error_code;
        const upstreamStatus = payload?.upstream_status;

        console.error("Chatbot API error", {
          status: resp.status,
          requestId,
          errorCode,
          upstreamStatus,
          payload,
        });

        // Prefer server-provided safe user message if present
        let errorMessage = payload?.error || "I'm currently taking a quick break. Please try again in a moment!";

        // Add slightly more helpful guidance for common infra cases
        if (resp.status === 502) {
          errorMessage = payload?.error || "Thrive AI is temporarily unavailable (server returned 502). Please try again in a moment.";
        } else if (resp.status === 503) {
          errorMessage = payload?.error || "Thrive AI is temporarily unavailable. Please try again shortly.";
        } else if (resp.status === 429) {
          errorMessage = payload?.error || "Thrive AI is getting a lot of traffic right now. Please try again shortly.";
        } else if (resp.status === 404) {
          errorMessage = payload?.error || "I couldn't reach the chat service. Please refresh and try again.";
        } else if (resp.status >= 400 && resp.status < 500) {
          errorMessage = payload?.error || "I didn't quite understand that request. Could you rephrase it?";
        }

        // Attach request id in console only; keep UI clean
        throw new Error(errorMessage);
      }

      const data = await resp.json();

      // Log detailed error information from response headers and body
      const aiModel = resp.headers.get("X-AI-Model");
      const aiStatus = resp.headers.get("X-AI-Status");
      const aiErrorCode = resp.headers.get("X-AI-Error-Code");
      const aiErrorMessage = resp.headers.get("X-AI-Error-Message");
      const requestId = resp.headers.get("X-Request-Id");

      console.group("🤖 Thrive AI Response");
      console.log("Model:", aiModel || "unknown");
      console.log("Status:", aiStatus || "unknown");
      console.log("Request ID:", requestId || "unknown");

      if (aiStatus === "error" || data.debug) {
        console.error("❌ AI Error Detected");
        console.error("Error Code:", aiErrorCode || data.debug?.errorCode || "unknown");
        console.error("Error Message:", aiErrorMessage || data.debug?.errorMessage || "unknown");
        console.error("Has Credentials:", data.debug?.hasCredentials ?? "unknown");

        // Show troubleshooting info for authentication errors
        if (data.debug?.mappedError?.code === "UPSTREAM_AI_AUTH") {
          console.error("🔐 AUTHENTICATION ERROR - Troubleshooting:");
          console.error("  • The Cloudflare API token or Account ID is invalid/expired");
          console.error("  • Check CF_API_TOKEN and CF_ACCOUNT_ID in Cloudflare Pages settings");
          console.error("  • Ensure the API token has Workers AI permissions");
          console.error("  • Verify credentials in: Cloudflare Dashboard > Pages > Your Site > Settings > Environment Variables");
          if (data.debug?.troubleshooting) {
            console.error("  • Details:", data.debug.troubleshooting);
          }
        } else if (data.debug?.mappedError?.code === "MISSING_AI_CREDENTIALS") {
          console.error("🔑 MISSING CREDENTIALS - Troubleshooting:");
          console.error("  • Add CF_ACCOUNT_ID and CF_API_TOKEN to Cloudflare Pages environment variables");
          console.error("  • Set them in: Cloudflare Dashboard > Pages > Your Site > Settings > Environment Variables");
        }

        if (data.debug?.mappedError?.details) {
          console.error("Error Details:", data.debug.mappedError.details);
        }

        console.error("Full Debug Info:", data.debug || {});
        console.error("Response Headers:", {
          model: aiModel,
          status: aiStatus,
          errorCode: aiErrorCode,
          errorMessage: aiErrorMessage
        });
      } else {
        console.log("✅ AI Response Successful");
      }

      if (data.debug) {
        console.warn("Debug Info Available:", data.debug);
      }

      console.log("Response Data:", data);
      console.groupEnd();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response) {
        const errorMsg = "I received an empty response. Please try asking your question again.";
        console.error("Empty response error:", {
          model: aiModel,
          status: aiStatus,
          data,
          requestId
        });
        throw new Error(errorMsg);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources: data.sources
        },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage = String(error?.message || "");

      console.group("❌ Chatbot Error");
      console.error("Error Object:", error);
      console.error("Error Name:", error?.name);
      console.error("Error Message:", errorMessage);
      console.error("Error Stack:", error?.stack);
      console.error("Error Details:", {
        name: error?.name,
        message: errorMessage,
        status: (error as any)?.status,
        response: (error as any)?.response,
        details: (error as any)?.details,
        originalError: (error as any)?.originalError
      });
      console.error("Request Details:", {
        userMessage: message,
        url: "/api/chat",
        method: "POST"
      });
      console.groupEnd();

      // Abort / timeout
      if (error?.name === 'AbortError') {
        console.warn("Request timeout/aborted");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "That took too long on my end. Please try again in a moment.",
          },
        ]);
      }
      // Network errors
      else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        console.error("Network error detected");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm having trouble connecting to the server. Please check your internet connection and try again."
          },
        ]);
      } else {
        // Use the error message from our detailed handling above
        console.error("General error - showing user-friendly message");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: message || "I'm currently experiencing technical difficulties. Please try again in a moment, or feel free to browse our products directly!"
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible && !isOpen) return null;
  if (isMobile) return null; // Hide on mobile

  return (
    <div data-chatbot-widget="true" className={cn("fixed z-[100] transition-all duration-500", anchorClass)}>
      {/* Chat Window - Only render when open */}
      {isOpen && (
        <div
          className={cn(
            "mb-3 w-[calc(100vw-2rem)] sm:w-[360px] lg:w-[380px] bg-card/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden transition-all duration-500 origin-bottom flex flex-col",
            isLaptop ? "h-[500px]" : "h-[600px]",
            "max-h-[calc(100vh-6rem)]",
            "opacity-100 scale-100 translate-y-0"
          )}
        >
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-glacier/20 to-ocean/20 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <img
                  src={BOT_AVATAR_URL}
                  alt={BOT_NAME}
                  className="w-10 h-10 rounded-2xl object-cover"
                  loading="eager"
                />
              </div>
              <div>
                <h3 className="font-display text-lg leading-tight">{BOT_NAME}</h3>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/5">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Container */}
          <div className="overflow-y-auto p-3 space-y-3 custom-scrollbar flex-1">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-1 animate-fade-in", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10"
                      : "bg-muted/50 border border-white/5 rounded-tl-none"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="space-y-1">
                      {formatMessage(m.content)}
                    </div>
                  ) : (
                    m.content
                  )}
                </div>

                {/* Sources */}
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1 px-1">
                    {m.sources.map((s, si) => (
                      <a
                        key={si}
                        href={s.url}
                        className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Info className="w-2.5 h-2.5" />
                        {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted/50 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] text-muted-foreground animate-pulse">ETA: &lt; 5s</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white/5 border-t border-white/5">
            <div className="flex gap-2 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="How can I help you today?"
                className="bg-black/20 border-white/10 rounded-2xl pr-12 h-12 focus-visible:ring-primary/50"
              />
              <Button
                size="icon"
                disabled={isLoading || !input.trim()}
                onClick={() => send()}
                className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative group w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_8px_20px_rgba(0,0,0,0.3)] border-2",
          isOpen
            ? "bg-muted border-white/10 rotate-90 scale-90"
            : "bg-primary border-primary/50 hover:scale-110 active:scale-95 glow"
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageSquare className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-primary" />
            </span>
          </>
        )}
      </button>
    </div>
  );
}
