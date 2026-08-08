import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";

import toast from "react-hot-toast";

import { askBusinessAi } from "../services/ai";

import "../styles/businessaichat.css";

const DEFAULT_MESSAGES = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "Hi! Naan BillFlow Business AI. Sales, stock, customers, pending amount, reports and billing data pathi kekalam.",
  },
];

const getStoredJson = (key) => {
  try {
    const value =
      localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    return null;
  }
};

const getCompanyIdentity = () => {
  const user =
    getStoredJson(
      "billFlowUser",
    );

  const company =
    getStoredJson(
      "billFlowCompany",
    );

  const companyId =
    user?.companyId?._id ||
    user?.companyId ||
    user?.company?._id ||
    user?.company?.id ||
    company?._id ||
    company?.id;

  if (companyId) {
    return String(
      companyId,
    );
  }

  const fallbackIdentity =
    company?.email ||
    user?.companyEmail ||
    user?.email;

  if (fallbackIdentity) {
    return String(
      fallbackIdentity,
    )
      .trim()
      .toLowerCase();
  }

  return null;
};

const getStorageKey = () => {
  const companyIdentity =
    getCompanyIdentity();

  if (!companyIdentity) {
    return null;
  }

  return `billFlowAiChatHistory_${companyIdentity}`;
};

const getCompanyName = () => {
  const company =
    getStoredJson(
      "billFlowCompany",
    );

  return (
    company?.companyName ||
    "BillFlow Business"
  );
};

const getInitialMessages = () => {
  const storageKey =
    getStorageKey();

  if (!storageKey) {
    return DEFAULT_MESSAGES;
  }

  try {
    const storedMessages =
      localStorage.getItem(
        storageKey,
      );

    if (!storedMessages) {
      return DEFAULT_MESSAGES;
    }

    const parsedMessages =
      JSON.parse(
        storedMessages,
      );

    if (
      Array.isArray(
        parsedMessages,
      ) &&
      parsedMessages.length > 0
    ) {
      return parsedMessages;
    }

    return DEFAULT_MESSAGES;
  } catch {
    return DEFAULT_MESSAGES;
  }
};

const BusinessAiChat = () => {
  const [isOpen, setIsOpen] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState(
      getInitialMessages,
    );

  const [isSending, setIsSending] =
    useState(false);

  const [
    activeStorageKey,
    setActiveStorageKey,
  ] = useState(
    getStorageKey,
  );

  const [
    companyName,
    setCompanyName,
  ] = useState(
    getCompanyName,
  );

  const popupRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const messageEndRef =
    useRef(null);

  const syncCompanyChat = () => {
    const newStorageKey =
      getStorageKey();

    const newCompanyName =
      getCompanyName();

    setCompanyName(
      newCompanyName,
    );

    if (!newStorageKey) {
      setActiveStorageKey(
        null,
      );

      setMessages(
        DEFAULT_MESSAGES,
      );

      return;
    }

    if (
      newStorageKey ===
      activeStorageKey
    ) {
      return;
    }

    setActiveStorageKey(
      newStorageKey,
    );

    try {
      const storedMessages =
        localStorage.getItem(
          newStorageKey,
        );

      if (!storedMessages) {
        setMessages(
          DEFAULT_MESSAGES,
        );

        return;
      }

      const parsedMessages =
        JSON.parse(
          storedMessages,
        );

      if (
        Array.isArray(
          parsedMessages,
        ) &&
        parsedMessages.length > 0
      ) {
        setMessages(
          parsedMessages,
        );
      } else {
        setMessages(
          DEFAULT_MESSAGES,
        );
      }
    } catch {
      setMessages(
        DEFAULT_MESSAGES,
      );
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    syncCompanyChat();
  }, [isOpen]);

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          const currentKey =
            getStorageKey();

          if (
            currentKey !==
            activeStorageKey
          ) {
            syncCompanyChat();
          }
        },
        1000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    activeStorageKey,
  ]);

  useEffect(() => {
    const handleStorageChange =
      () => {
        syncCompanyChat();
      };

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
    };
  }, [
    activeStorageKey,
  ]);

  useEffect(() => {
    if (!activeStorageKey) {
      return;
    }

    localStorage.setItem(
      activeStorageKey,
      JSON.stringify(
        messages,
      ),
    );
  }, [
    messages,
    activeStorageKey,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    inputRef.current?.focus();
  }, [
    isOpen,
    messages,
  ]);

  useEffect(() => {
    const handleEscape = (
      event,
    ) => {
      if (
        event.key === "Escape"
      ) {
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    isOpen,
  ]);

  const handleOpenChat = () => {
    const currentKey =
      getStorageKey();

    const currentName =
      getCompanyName();

    setCompanyName(
      currentName,
    );

    if (
      currentKey !==
      activeStorageKey
    ) {
      setActiveStorageKey(
        currentKey,
      );

      if (currentKey) {
        try {
          const storedMessages =
            localStorage.getItem(
              currentKey,
            );

          if (storedMessages) {
            const parsedMessages =
              JSON.parse(
                storedMessages,
              );

            setMessages(
              Array.isArray(
                parsedMessages,
              ) &&
                parsedMessages.length >
                  0
                ? parsedMessages
                : DEFAULT_MESSAGES,
            );
          } else {
            setMessages(
              DEFAULT_MESSAGES,
            );
          }
        } catch {
          setMessages(
            DEFAULT_MESSAGES,
          );
        }
      } else {
        setMessages(
          DEFAULT_MESSAGES,
        );
      }
    }

    setIsOpen(true);
  };

  const handleSendQuestion =
    async (event) => {
      event?.preventDefault();

      const trimmedQuestion =
        question.trim();

      if (
        !trimmedQuestion ||
        isSending
      ) {
        return;
      }

      const currentKey =
        getStorageKey();

      if (!currentKey) {
        toast.error(
          "Company information not available.",
        );

        return;
      }

      if (
        currentKey !==
        activeStorageKey
      ) {
        setActiveStorageKey(
          currentKey,
        );

        setMessages(
          DEFAULT_MESSAGES,
        );

        toast.error(
          "Company changed. AI chat refreshed.",
        );

        return;
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content:
          trimmedQuestion,
      };

      const conversationHistory =
        messages
          .filter(
            (message) =>
              message.id !==
                "welcome-message" &&
              !message.isError &&
              (
                message.role ===
                  "user" ||
                message.role ===
                  "assistant"
              ),
          )
          .slice(-10)
          .map((message) => ({
            role:
              message.role,

            content:
              message.content,
          }));

      setMessages(
        (
          currentMessages,
        ) => [
          ...currentMessages,
          userMessage,
        ],
      );

      setQuestion("");
      setIsSending(true);

      try {
        const response =
          await askBusinessAi(
            trimmedQuestion,
            conversationHistory,
          );

        const aiMessage = {
          id: `assistant-${Date.now()}`,

          role:
            "assistant",

          content:
            response?.answer ||
            "Answer kidaikala.",
        };

        setMessages(
          (
            currentMessages,
          ) => [
            ...currentMessages,
            aiMessage,
          ],
        );
      } catch (error) {
        console.error(
          "Business AI error:",
          error,
        );

        const backendMessage =
          error.response?.data
            ?.message;

        const errorText =
          Array.isArray(
            backendMessage,
          )
            ? backendMessage[0]
            : backendMessage ||
              "AI response get panna mudiyala.";

        setMessages(
          (
            currentMessages,
          ) => [
            ...currentMessages,
            {
              id: `error-${Date.now()}`,

              role:
                "assistant",

              content:
                errorText,

              isError:
                true,
            },
          ],
        );

        toast.error(
          errorText,
        );
      } finally {
        setIsSending(
          false,
        );
      }
    };

  const handleInputKeyDown = (
    event,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendQuestion();
    }
  };

  const handleClearHistory =
    () => {
      const currentKey =
        getStorageKey();

      if (!currentKey) {
        return;
      }

      const isConfirmed =
        window.confirm(
          "Intha company AI chat history clear panna confirm ah?",
        );

      if (!isConfirmed) {
        return;
      }

      setMessages(
        DEFAULT_MESSAGES,
      );

      localStorage.setItem(
        currentKey,
        JSON.stringify(
          DEFAULT_MESSAGES,
        ),
      );

      toast.success(
        "AI chat history cleared",
      );
    };

  const handleOverlayClick = (
    event,
  ) => {
    if (
      event.target ===
      event.currentTarget
    ) {
      setIsOpen(false);
    }
  };

  const popupContent =
    isOpen ? (
      <div
        className="business-ai-overlay"
        onMouseDown={
          handleOverlayClick
        }
        role="presentation"
      >
        <section
          ref={
            popupRef
          }
          className="business-ai-popup"
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-ai-title"
        >
          <header className="business-ai-header">
            <div className="business-ai-heading">
              <div className="business-ai-logo">
                <FiZap />
              </div>

              <div>
                <span className="business-ai-header-label">
                  Smart Assistant
                </span>

                <h2 id="business-ai-title">
                  BillFlow Business AI
                </h2>

                <p>
                  {
                    companyName
                  }
                </p>
              </div>
            </div>

            <div className="business-ai-header-actions">
              <button
                type="button"
                className="business-ai-clear-btn"
                onClick={
                  handleClearHistory
                }
                disabled={
                  isSending
                }
                title="Clear chat history"
                aria-label="Clear chat history"
              >
                <FiTrash2 />
              </button>

              <button
                type="button"
                className="business-ai-close-btn"
                onClick={() =>
                  setIsOpen(
                    false,
                  )
                }
                title="Close AI"
                aria-label="Close AI"
              >
                <FiX />
              </button>
            </div>
          </header>

          <div className="business-ai-context-bar">
            <span className="business-ai-context-dot" />

            <span>
              Connected to{" "}
              {
                companyName
              }{" "}
              data
            </span>
          </div>

          <div className="business-ai-messages">
            {messages.map(
              (
                message,
              ) => (
                <div
                  key={
                    message.id
                  }
                  className={`business-ai-message-row ${
                    message.role ===
                    "user"
                      ? "user"
                      : "assistant"
                  }`}
                >
                  {message.role ===
                    "assistant" && (
                    <div className="business-ai-message-avatar">
                      <FiZap />
                    </div>
                  )}

                  <div
                    className={`business-ai-message ${
                      message.isError
                        ? "error"
                        : ""
                    }`}
                  >
                    {
                      message.content
                    }
                  </div>
                </div>
              ),
            )}

            {isSending && (
              <div className="business-ai-message-row assistant">
                <div className="business-ai-message-avatar">
                  <FiZap />
                </div>

                <div className="business-ai-message typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div
              ref={
                messageEndRef
              }
            />
          </div>

          <form
            className="business-ai-input-area"
            onSubmit={
              handleSendQuestion
            }
          >
            <div className="business-ai-input-wrapper">
              <textarea
                ref={
                  inputRef
                }
                value={
                  question
                }
                onChange={(
                  event,
                ) =>
                  setQuestion(
                    event
                      .target
                      .value,
                  )
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder="Ask about sales, stock, customers..."
                rows={1}
                maxLength={
                  1000
                }
                disabled={
                  isSending
                }
              />

              <span className="business-ai-character-count">
                {
                  question.length
                }
                /1000
              </span>
            </div>

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
            <FiZap />

            <span>
              AI answers are based on
              your BillFlow business
              data.
            </span>
          </div>
        </section>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        className={`topbar-icon-btn business-ai-topbar-btn ${
          isOpen
            ? "active"
            : ""
        }`}
        onClick={
          handleOpenChat
        }
        aria-label="Open Business AI"
        title="Business AI"
      >
        <FiMessageCircle />

        <span className="business-ai-topbar-badge">
          AI
        </span>
      </button>

      {popupContent &&
        createPortal(
          popupContent,
          document.body,
        )}
    </>
  );
};

export default BusinessAiChat;