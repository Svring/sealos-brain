"use client";

import { PromptInputBox } from "@/components/ai/ai-prompt-box";
import { MenuBar } from "@/components/ui/bottom-menu";
import { MessageSwiper } from "@/components/ui/message-swiper";
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
} from "@xyflow/react";

import { invokeAgentChat } from "@/provider/backbone/backbone-provider";

import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

import { ChevronUp, ChevronDown } from "lucide-react";

import nodeTypes from "@/components/node/node-types";
import edgeTypes from "@/components/edge/edge-types";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const menuItems = [
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        {...props}
      >
        <title>msg</title>
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path d="M9,1.75C4.996,1.75,1.75,4.996,1.75,9c0,1.319,.358,2.552,.973,3.617,.43,.806-.053,2.712-.973,3.633,1.25,.068,2.897-.497,3.633-.973,.489,.282,1.264,.656,2.279,.848,.433,.082,.881,.125,1.338,.125,4.004,0,7.25-3.246,7.25-7.25S13.004,1.75,9,1.75Z" />
        </g>
      </svg>
    ),
    label: "Messages",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        {...props}
      >
        <title>envelope</title>
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path d="M1.75,5.75l6.767,3.733c.301,.166,.665,.166,.966,0l6.767-3.733" />
          <rect
            x="1.75"
            y="3.25"
            width="14.5"
            height="11.5"
            rx="2"
            ry="2"
            transform="translate(18 18) rotate(180)"
          />
        </g>
      </svg>
    ),
    label: "Mail",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        {...props}
      >
        <title>hashtag</title>
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <line x1="3.75" y1="6.25" x2="15.25" y2="6.25" />
          <line x1="2.75" y1="11.75" x2="14.25" y2="11.75" />
          <line x1="7.633" y1="2.75" x2="5.289" y2="15.25" />
          <line x1="12.711" y1="2.75" x2="10.367" y2="15.25" />
        </g>
      </svg>
    ),
    label: "Explore",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        {...props}
      >
        <title>upload-4</title>
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path d="M15.25,11.75v1.5c0,1.105-.895,2-2,2H4.75c-1.105,0-2-.895-2-2v-1.5" />
          <polyline points="12.5 6.25 9 2.75 5.5 6.25" />
          <line x1="9" y1="2.75" x2="9" y2="10.25" />
        </g>
      </svg>
    ),
    label: "Share",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        {...props}
      >
        <title>feather-plus</title>
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path d="M13.974,9.731c-.474,3.691-3.724,4.113-6.974,3.519" />
          <path d="M3.75,16.25S5.062,4.729,16.25,3.75c-.56,.976-.573,2.605-.946,4.239-.524,2.011-2.335,2.261-4.554,2.261" />
          <line x1="4.25" y1="1.75" x2="4.25" y2="6.75" />
          <line x1="6.75" y1="4.25" x2="1.75" y2="4.25" />
        </g>
      </svg>
    ),
    label: "Write",
  },
  {
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        {...props}
      >
        <title>menu</title>
        <g
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <line x1="2.25" y1="9" x2="15.75" y2="9" />
          <line x1="2.25" y1="3.75" x2="15.75" y2="3.75" />
          <line x1="2.25" y1="14.25" x2="15.75" y2="14.25" />
        </g>
      </svg>
    ),
    label: "Menu",
  },
];

const initialNodes: Node[] = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  { id: "3", type: "devbox", position: { x: 0, y: 200 }, data: { label: "3" } },
];
const initialEdges: Edge[] = [
  { id: "e1-2", type: "step-edge", source: "1", target: "2", animated: true },
];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "example-1",
      content:
        "Welcome! I'm your AI assistant. I can help you with various tasks. Feel free to ask me anything!",
      role: "assistant",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
    {
      id: "example-3",
      content:
        "Of course! I'd be happy to help. What kind of project are you working on? I can assist with coding, design, planning, or any other aspects you need help with.",
      role: "assistant",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messageContentRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(messages.length);
  const [isInputExpanded, setIsInputExpanded] = useState(true);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      setCurrentMessageIndex(messages.length - 1);
      setIsExpanded(true);
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement === document.body) {
        setIsInputExpanded((prev) => !prev);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isInputExpanded && promptTextareaRef.current) {
      promptTextareaRef.current.focus();
    }
  }, [isInputExpanded]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onMessageSend = useCallback(async (message: string, files?: File[]) => {
    setIsExpanded(true);
    setIsLoading(true);

    try {
      const response = await invokeAgentChat("1", message, files);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, there was an error processing your request.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        colorMode="dark"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        panOnScroll
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <AnimatePresence>
        {isInputExpanded && (
          <motion.div 
            key="input-box"
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[35%] min-w-[400px] max-w-[600px] z-50 flex flex-col gap-0 bg-transparent p-4 rounded-lg"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {messages.length > 0 && (
              <motion.div
                className="overflow-hidden transform translate-y-3 relative z-0"
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 45 }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                style={{ maxHeight: isExpanded ? '300px' : '45px' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentMessageIndex}-${messages.length}`}
                    ref={messageContentRef}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 30,
                      duration: 0.4
                    }}
                  >
                    <MessageSwiper 
                      messages={messages}
                      currentIndex={currentMessageIndex}
                      onIndexChange={setCurrentMessageIndex}
                      isExpanded={isExpanded}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
            <motion.div
              className="relative z-10"
            >
              <PromptInputBox ref={undefined} textareaRef={promptTextareaRef} onSend={onMessageSend} isLoading={isLoading} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed top-5 right-5 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        <MenuBar items={menuItems} />
      </motion.div>
    </div>
  );
}
