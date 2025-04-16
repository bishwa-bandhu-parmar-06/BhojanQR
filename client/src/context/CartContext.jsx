import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]); // 🔥 Yeh line cart ko khali karegi
  };

  // order receive success
  const [customer, setCustomer] = useState([]);
  const backendUri =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

  const orderRecieveSuccess = async () => {
    try {
      const response = await axios.get(
        `${backendUri}/api/orderreceived/order-receive`
      );
      setCustomer(response.data.response); // assuming this is an array
      // console.log("Received Orders : ", response.data.response);
    } catch (error) {
      console.error("Error fetching Order Details:", error);
    }
  };

  useEffect(() => {
    orderRecieveSuccess();
  }, []);

// fetchMenuListViaName
const [fetchMenuValue, setFetchMenuValue] = useState(null);
const fetchMenuListViaName = (value) =>{
  setFetchMenuValue(value);
}


  return (
    <CartContext.Provider
      value={{
        cart,
        fetchMenuListViaName,
        fetchMenuValue,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalPrice,
        clearCart, // 👈 isko add karna zaroori hai
        orderRecieveSuccess,
        customer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
