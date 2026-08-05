import { createContext, useEffect, useState, } from "react";
import { toast } from "sonner";
import { cart as cartApi } from "../services/api";
export interface CartItem {
id: number;
name: string;
price: number;
image: string;
quantity: number;
}
export interface CartContextType {
items: CartItem[];
addItem: (product: Omit<CartItem, "quantity">) => void;
removeItem: (id: number) => void;
updateQuantity: (id: number, quantity: number) => void;
totalItems: number;
totalPrice: number;
clearCart: () => void;
isOpen: boolean;
openCart: () => void;
closeCart: () => void;
syncGuestCartToBackend: () => Promise<void>;
}
export const CartContext = createContext<CartContextType | undefined>(undefined);
export function CartProvider({ children }: { children: React.ReactNode }) {
const [items, setItems] = useState<CartItem[]>(() => {
try {
const saved = localStorage.getItem("hera_cart");
return saved ? JSON.parse(saved) : [];
} catch {
localStorage.removeItem("hera_cart");
return [];
}
});
const [isOpen, setIsOpen] = useState(false);
useEffect(() => {
localStorage.setItem("hera_cart", JSON.stringify(items));
}, [items]);
const addItem = (product: Omit<CartItem, "quantity">) => {
setItems(prev => {
const existing = prev.find(item => item.id === product.id);
if (existing) {
toast.success(`+1 ${product.name} in cart`);
return prev.map(item =>
item.id === product.id
? { ...item, quantity: item.quantity + 1 }
: item
);
}
toast.success(`${product.name} added ✨`);
return [...prev, { ...product, quantity: 1 }];
});
setIsOpen(true);
};
const removeItem = (id: number) => {
setItems ((prev) => prev.filter((item) => item.id !== id));
toast.info("Item removed");
};
const updateQuantity = (id: number, quantity: number) => {
if (quantity <= 0) {
removeItem(id);
return;
}
setItems((prev) =>
prev.map((item) =>
item.id === id ? { ...item, quantity } : item
)
);
};
const syncGuestCartToBackend = async () => {
const guestItems = items;
if (guestItems.length === 0) return;
try {
for (const item of guestItems) {
await cartApi.add(item.id, item.quantity);
}
setItems([]);
toast.success('Cart synced to your account');
} catch (error) {
toast.error('Failed to sync cart. Please try again.');
}
};
return (
<CartContext.Provider
value={{
items,
addItem,
removeItem,
updateQuantity,
totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
totalPrice: items.reduce(
(sum, item) => sum + item.quantity * item.price,
0
),
clearCart: () => setItems([]),
isOpen,
openCart: () => setIsOpen(true),
closeCart: () => setIsOpen(false),
syncGuestCartToBackend,
}}
>
{children}
</CartContext.Provider>
);
}
