import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../../API/Cart/getAllCartProductApi";
import { getAllWishlistProducts } from "../../API/Cart/wishListApi";
import {
  setCartQuantity,
  clearCartQuantity,
} from "../../Features/Cart/CartSlice";
import { setWishlist } from "../../Features/Cart/WishlistSlice";

const AuthDataLoader = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user?.role === "user") {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            getCart(),
            getAllWishlistProducts(),
          ]);

          if (cartRes?.success) {
            dispatch(setCartQuantity(cartRes.cart?.totalQuantity || 0));
          }
          if (wishlistRes?.success) {
            dispatch(setWishlist(wishlistRes.items || []));
          }
        } catch (error) {
          console.error("Error loading initial auth data:", error);
        }
      } else {
        dispatch(clearCartQuantity());
        dispatch(setWishlist([]));
      }
    };

    loadData();
  }, [isAuthenticated, user?.role, dispatch]);

  return null;
};

export default AuthDataLoader;
