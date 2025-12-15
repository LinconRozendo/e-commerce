"use client";
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./auth"; 

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    // Função que contar quantos itens tem no carrinho
    const fetchCartCount = async () => {
        if (!user) {
            setCartCount(0);
            return;
        }
        try {
            const res = await api.get("/cart");
            const cart = res.data;
            
            let total = 0;
            if (cart && cart.items) {
                total = cart.items.reduce((acc, item) => acc + item.quantity, 0);
            }
            setCartCount(total);
        } catch (error) {
            console.error("Erro ao contar itens do carrinho", error);
            setCartCount(0);
        }
    };

    // Atualiza sempre que o usuário muda (login/logout)
    useEffect(() => {
        fetchCartCount();
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);