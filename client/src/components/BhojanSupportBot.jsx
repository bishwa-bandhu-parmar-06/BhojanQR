import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { sendLandingChatMessage } from "../API/chatBotApi";

const BhojanSupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! 🙏 I am the BhojanQR Support AI. Are you a restaurant owner looking to digitize your menu, or just curious about how we work?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      // 🚀 Using the new API function
      const data = await sendLandingChatMessage(userMessage);
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      toast.error("Network issue. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Oops! I lost connection. Please email us at bhojanqr@gmail.com 📧",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button - ORANGE THEME */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[90] p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-[0_10px_25px_rgba(234,88,12,0.4)] transition-all transform hover:scale-110 active:scale-95 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <Bot 
          size={32} 
          className="transform transition-transform duration-300 origin-bottom group-hover:rotate-12 group-hover:-translate-y-1" 
        />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-0 right-0 md:bottom-8 md:right-8 z-[100] w-full md:w-[380px] h-[80vh] md:h-[550px] bg-white md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 pointer-events-none translate-y-10"
        }`}
      >
        {/* Header - ORANGE THEME */}
        <div className="bg-orange-500 text-white px-5 py-4 flex justify-between items-center md:rounded-t-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-20 transform translate-x-4 -translate-y-4">
            <Sparkles size={100} />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-md border border-white/30">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-none tracking-tight">
                BhojanQR Guide
              </h3>
              <span className="text-[10px] font-bold text-orange-100 uppercase tracking-widest flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse shadow-[0_0_5px_#86efac]"></span>{" "}
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 no-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.sender === "user"
                    ? "bg-orange-500 text-white font-medium rounded-br-none" // User Bubble: Orange
                    : "bg-white border border-gray-100 text-gray-700 font-medium rounded-bl-none leading-relaxed" // Bot Bubble: White
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-4 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 md:rounded-b-3xl">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 transition-colors shadow-sm"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BhojanSupportBot;
