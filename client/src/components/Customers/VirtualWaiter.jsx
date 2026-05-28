import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Mic, MicOff } from "lucide-react";
import { sendMessageToAI } from "../../API/chatBotApi";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
// 🚀 Importing all required actions from Redux
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../Features/Cart/CartSlice";

const VirtualWaiter = ({ restaurantId }) => {
  const dispatch = useDispatch();
  // Fetching current cart items state to handle decrease functionality safely
  const currentCartItems = useSelector((state) => state.cart?.items || []);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! I'm your virtual waiter 🤵‍♂️. You can type or tap the Mic to order, remove, or clear your cart!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 🎤 STABLE SPEECH RECOGNITION SETUP (English Toasts & Hinglish Engine)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();

      rec.continuous = false;
      rec.interimResults = false;

      // Changed to 'hi-IN'. Yeh Hindi aur English mix (Hinglish) dono ko bohot acche se catch karta hai.
      rec.lang = "hi-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          setInput(transcript);
          handleApiCall(transcript);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);

        // Keeping all Toast messages strictly in English as requested
        if (event.error === "no-speech") {
          toast.error("No speech detected. Please speak a little louder! 🎤");
        } else if (event.error === "network") {
          toast.error(
            "Speech network error. Please try typing your request! ⌨️",
          );
        } else if (event.error === "not-allowed") {
          toast.error("Microphone permission denied by your browser.");
        } else {
          toast.error("Mic error: " + event.error);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [restaurantId]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput("");
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  //  BULLETPROOF ACTION PARSER WITH INITIAL CART VALIDATION LOCK
  const handleApiCall = async (userText) => {
    if (!userText.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessageToAI(restaurantId, userText);
      const aiData = response.data;

      let finalReplyMessage = aiData.replyMessage;
      let shouldExecuteAction = true;

      //  REMOVE_ITEM aur DECREASE_QUANTITY ke liye pehle cart validate karo
      if (
        aiData.type === "REMOVE_ITEM" ||
        aiData.type === "DECREASE_QUANTITY"
      ) {
        let itemExistsInCart = false;

        aiData.actions?.forEach((action) => {
          let targetId = action.menuItemId || action.id || action._id;

          // ID Fallback check (Name se real ID dhoondo)
          if (targetId && targetId.length !== 24) {
            const matchedItem = currentCartItems.find(
              (item) =>
                item.name.toLowerCase().trim() ===
                  action.name.toLowerCase().trim() ||
                item.name.toLowerCase().trim() ===
                  targetId.toLowerCase().trim(),
            );
            if (matchedItem) targetId = matchedItem._id;
          }

          // Real check: Kya yeh ID sach me cart me hai?
          const foundInCart = currentCartItems.find((i) => i._id === targetId);
          if (foundInCart) {
            itemExistsInCart = true;
            action.resolvedId = targetId; // Future use ke liye ID save kar lo
          }
        });

        //  AGAR ITEM CART ME NAHI HAI
        if (!itemExistsInCart) {
          shouldExecuteAction = false; // Action block kar do
          const itemName = aiData.actions?.[0]?.name || "This item";

          // AI ke reply aur speech ko change karo
          finalReplyMessage = `${itemName} is not in your cart, so I cannot remove it.`;
          toast.error(`${itemName} is not in your cart!`);
        }
      }

      //  CLEAR_CART agar pehle se hi khali hai
      if (aiData.type === "CLEAR_CART" && currentCartItems.length === 0) {
        shouldExecuteAction = false;
        finalReplyMessage = "Your cart is already empty!";
        toast.error("Cart is already empty!");
      }

      // Show AI reply in chat window & speak out loud
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: finalReplyMessage },
      ]);
      speakText(finalReplyMessage);

      //  EXECUTE OPERATIONS ONLY IF VALIDATION PASSED
      if (shouldExecuteAction) {
        // ADD ORDER ACTION
        if (aiData.type === "ADD_ORDER" && aiData.actions?.length > 0) {
          aiData.actions.forEach((action) => {
            const targetId = action.menuItemId || action.id || action._id;
            const cartItem = {
              _id: targetId,
              name: action.name,
              price: action.price || 0,
              quantity: 1,
            };
            if (targetId) {
              for (let i = 0; i < (action.quantity || 1); i++) {
                dispatch(addToCart(cartItem));
              }
            }
          });
          toast.success("Items added to cart!");
        }

        // 2. REMOVE ITEM COMPLETELY ACTION
        else if (aiData.type === "REMOVE_ITEM" && aiData.actions?.length > 0) {
          aiData.actions.forEach((action) => {
            const targetId =
              action.resolvedId || action.menuItemId || action.id || action._id;
            if (targetId) {
              dispatch(removeFromCart(targetId));
            }
          });
          toast.success("Item completely removed!");
        }

        // 3. DECREASE QUANTITY ACTION
        else if (
          aiData.type === "DECREASE_QUANTITY" &&
          aiData.actions?.length > 0
        ) {
          aiData.actions.forEach((action) => {
            const targetId =
              action.resolvedId || action.menuItemId || action.id || action._id;
            if (targetId) {
              const existing = currentCartItems.find((i) => i._id === targetId);
              if (existing) {
                const newQty = existing.quantity - (action.quantity || 1);
                if (newQty <= 0) {
                  dispatch(removeFromCart(targetId));
                } else {
                  dispatch(updateQuantity({ id: targetId, quantity: newQty }));
                }
              }
            }
          });
          toast.success("Quantity reduced!");
        }

        //CLEAR ALL AT ONCE ACTION
        else if (aiData.type === "CLEAR_CART") {
          dispatch(clearCart());
          toast.success("Cart cleared completely!");
        }
      }
    } catch (error) {
      console.error("Error processing AI actions:", error);
      toast.error("Bot side configuration error.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    handleApiCall(input.trim());
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[70] p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-[0_10px_25px_rgba(234,88,12,0.4)] transition-all transform hover:scale-110 active:scale-95 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
      >
        <Bot size={28} />
      </button>

      <div
        className={`fixed bottom-0 right-0 md:bottom-8 md:right-8 z-[100] w-full md:w-[380px] h-[75vh] md:h-[550px] bg-white md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 transform origin-bottom-right ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 pointer-events-none translate-y-10"}`}
      >
        {/* Header */}
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
                Smart Assistant 🤵‍♂️
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

        {/* Chat Area */}
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

        {/* Input Area with MIC */}
        <div className="p-3 bg-white border-t border-gray-100 md:rounded-b-3xl">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1 pl-2"
          >
            <button
              type="button"
              onClick={toggleListen}
              className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-400 hover:bg-gray-200 hover:text-orange-500"}`}
            >
              <Mic size={20} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? "Sunn raha hu boliye..."
                  : "Ask or order something..."
              }
              disabled={isListening}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400 font-medium"
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
