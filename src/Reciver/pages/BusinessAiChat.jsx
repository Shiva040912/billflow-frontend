import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import { askBusinessAi } from "../services/ai";

import "../styles/businessaichat.css";

const STORAGE_KEY = "billFlowAiChatHistory";

const DEFAULT_MESSAGES = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "Hi! Naan BillFlow Business AI. Stock, sales, customers, pending amount, reports, billing calculation pathi kekalam.",
  },
];

const BusinessAiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
    const storedMessages =
      localStorage.getItem(STORAGE_KEY);

    if (!storedMessages) {
      return DEFAULT_MESSAGES;
    }

    try {
      const parsedMessages =
        JSON.parse(storedMessages);

      return Array.isArray(parsedMessages) &&
        parsedMessages.length > 0
        ? parsedMessages
        : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });

  const [isSending, setIsSending] =
    useState(false);

  const popupRef = useRef(null);
  const inputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages),
    );
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    inputRef.current?.focus();
  }, [isOpen, messages]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const handleSendQuestion = async (event) => {
    event?.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setQuestion("");
    setIsSending(true);

    try {
      const response =
        await askBusinessAi(
          trimmedQuestion,
        );

      const aiMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          response?.answer ||
          "Answer kidaikala.",
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "Business AI error:",
        error,
      );

      const backendMessage =
        error.response?.data?.message;

      const errorText = Array.isArray(
        backendMessage,
      )
        ? backendMessage[0]
        : backendMessage ||
          "AI response get panna mudiyala.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: errorText,
          isError: true,
        },
      ]);

      toast.error(errorText);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendQuestion();
    }
  };

  const handleClearHistory = () => {
    const isConfirmed = window.confirm(
      "AI chat history clear panna confirm ah?",
    );

    if (!isConfirmed) {
      return;
    }

    setMessages(DEFAULT_MESSAGES);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_MESSAGES),
    );

    toast.success("AI chat history cleared");
  };

  const handleOverlayClick = (event) => {
    if (
      event.target === event.currentTarget
    ) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="business-ai-floating-btn"
        onClick={() =>
          setIsOpen(true)
        }
        aria-label="Open Business AI"
        title="Business AI"
      >
        <FiMessageCircle />

        <span>AI</span>
      </button>

      {isOpen && (
        <div
          className="business-ai-overlay"
          onMouseDown={handleOverlayClick}
          role="presentation"
        >
          <section
            ref={popupRef}
            className="business-ai-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="business-ai-title"
          >
            <header className="business-ai-header">
              <div className="business-ai-heading">
                <div className="business-ai-logo">
                  AI
                </div>

                <div>
                  <h2 id="business-ai-title">
                    BillFlow Business AI
                  </h2>

                  <p>
                    Stock, sales and reports assistant
                  </p>
                </div>
              </div>

              <div className="business-ai-header-actions">
                <button
                  type="button"
                  className="business-ai-clear-btn"
                  onClick={handleClearHistory}
                  disabled={isSending}
                  title="Clear chat history"
                >
                  <FiTrash2 />
                </button>

                <button
                  type="button"
                  className="business-ai-close-btn"
                  onClick={() =>
                    setIsOpen(false)
                  }
                  title="Close AI"
                >
                  <FiX />
                </button>
              </div>
            </header>

            <div className="business-ai-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`business-ai-message-row ${
                    message.role === "user"
                      ? "user"
                      : "assistant"
                  }`}
                >
                  {message.role ===
                    "assistant" && (
                    <div className="business-ai-message-avatar">
                      AI
                    </div>
                  )}

                  <div
                    className={`business-ai-message ${
                      message.isError
                        ? "error"
                        : ""
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="business-ai-message-row assistant">
                  <div className="business-ai-message-avatar">
                    AI
                  </div>

                  <div className="business-ai-message typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            <form
              className="business-ai-input-area"
              onSubmit={handleSendQuestion}
            >
              <textarea
                ref={inputRef}
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder="Example: Innaiku sales evlo?"
                rows={1}
                maxLength={1000}
                disabled={isSending}
              />

              <button
                type="submit"
                className="business-ai-send-btn"
                disabled={
                  isSending ||
                  !question.trim()
                }
                aria-label="Send question"
              >
                <FiSend />
              </button>
            </form>

            <div className="business-ai-footer-note">
              AI answers business data base panni varum.
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default BusinessAiChat;