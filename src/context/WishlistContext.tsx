import { createContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface WishlistItem {
id: number;
name: string;
price: number;
image: string;
}
export interface WishlistContextType {
items: WishlistItem[];
toggleItem: (product: WishlistItem) => void;
isInWishlist: (id: number) => boolean;
}
export const WishlistContext = createContext<WishlistContextType | undefined>(
undefined
);
interface WishlistProviderProps {
children: React.ReactNode;
}
export function WishlistProvider({
children,
}: WishlistProviderProps) {
const [items, setItems] = useState<WishlistItem[]>(() => {
try {
const saved = localStorage.getItem("hera_wishlist");
return saved ? (JSON.parse(saved) as WishlistItem[]) : [];
} catch {
localStorage.removeItem("hera_wishlist");
return [];
}
});
useEffect(() => {
localStorage.setItem("hera_wishlist", JSON.stringify(items));
}, [items]);
const toggleItem = (product: WishlistItem) => {
setItems((prev) => {
const exists = prev.some((item) => item.id === product.id);
if (exists) {
toast.info(`${product.name} removed from wishlist`);
return prev.filter((item) => item.id !== product.id);
}
toast.success(`${product.name} added to wishlist ❤️
`);
return [...prev, product];
});
};
const isInWishlist = (id: number) =>
items.some((item) => item.id === id);

return (
<WishlistContext.Provider
value={{
items,
toggleItem,
isInWishlist,
}}
>
{children}
</WishlistContext.Provider>
);
}
