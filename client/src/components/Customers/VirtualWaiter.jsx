import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { sendMessageToAI } from "../../API/chatBotApi";
import { toast } from "react-hot-toast";

const VirtualWaiter = ({ restaurantId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! I'm your virtual waiter 🤵‍♂️. Ask me anything about the menu!",
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
      const data = await sendMessageToAI(restaurantId, userMessage);
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      toast.error("Bot is taking a nap. Try again!");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I am having trouble connecting to the kitchen right now. 😔",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Right Side) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[70] p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-[0_10px_25px_rgba(234,88,12,0.4)] transition-all transform hover:scale-110 active:scale-95 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window - CHANGED TO z-[100] TO OVERLAP THE CART BUTTON */}
      <div
        className={`fixed bottom-0 right-0 md:bottom-8 md:right-8 z-[100] w-full md:w-[380px] h-[75vh] md:h-[550px] bg-white md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-90 opacity-0 pointer-events-none translate-y-10"
        }`}
      >
        <div className="bg-orange-500 text-white px-5 py-4 flex justify-between items-center md:rounded-t-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-black text-lg leading-none tracking-tight">
                AI Waiter
              </h3>
              <span className="text-[10px] font-medium text-orange-100 uppercase tracking-widest">
                Always at your service
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50 no-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${msg.sender === "user" ? "bg-orange-500 text-white rounded-br-none" : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white border-t border-gray-100 md:rounded-b-3xl">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:bg-gray-300 transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default VirtualWaiter;
