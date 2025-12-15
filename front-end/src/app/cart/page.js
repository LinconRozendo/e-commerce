"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../contexts/auth";
import { useCart } from "../../contexts/cart";

export default function CartPage() {
    const { user, loading: authLoading } = useAuth();
    const { fetchCartCount } = useCart();
    const router = useRouter();
    
    const [cart, setCart] = useState(null); // Estado para guardar o carrinho
    const [loading, setLoading] = useState(true);

    // Busca o Carrinho
    const fetchCart = async () => {
        try {
            const res = await api.get("/cart");
            setCart(res.data);
        } catch (error) {
            setCart({ items: [], total: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
            } else {
                fetchCart();
            }
        }
    }, [user, authLoading, router]);

    const handleRemoveItem = async (productId) => {
        if (!confirm("Tem certeza que deseja remover este item?")) return;

        try {
            await api.delete(`/cart/${productId}`);
            
            fetchCart();      
            fetchCartCount();   
        } catch (error) {
            console.error(error);
            alert("Erro ao remover item.");
        }
    }

    // Função de Checkout
    const handleCheckout = async () => {
        const confirm = window.confirm("Deseja finalizar a compra?");
        if (!confirm) return;

        try {
            await api.post("/cart/checkout");
            alert("Compra realizada com sucesso!");
            fetchCart();
            fetchCartCount();
            router.push("/order"); 
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.msg || "Erro ao finalizar compra.");
        }
    };

    if (loading || authLoading) {
        return <div className="text-center mt-20 text-gray-500 animate-pulse">Carregando carrinho... 🛒</div>;
    }

    // Se carrinho estiver vazio
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto mt-10 p-8 text-center bg-white rounded-lg shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Seu carrinho está vazio</h2>
                <p className="text-gray-500 mb-6">Que tal adicionar alguns jogos?</p>
                <button 
                    onClick={() => router.push("/")}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Voltar para a Loja
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto mt-8 mb-20">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Carrinho de Compras</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Lista de Itens */}
                <div className="md:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex items-center bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition relative">
                            {/* Imagem */}
                            <div className="h-20 w-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => router.push(`/products/${item.Product?.id}`)}>
                                {item.Product?.url ? (
                                    <img src={item.Product.url} alt={item.Product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="flex items-center justify-center h-full text-xs text-gray-400">Sem Foto</span>
                                )}
                            </div>

                            <div className="ml-4 flex-grow">
                                <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => router.push(`/products/${item.Product?.id}`)}>
                                    {item.Product?.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-1">{item.Product?.description}</p>
                                
                                {/* Botão Remover (Mobile/Desktop) */}
                                <button 
                                    onClick={() => handleRemoveItem(item.Product?.id)}
                                    className="text-red-500 text-sm mt-2 hover:text-red-700 flex items-center gap-1 font-medium transition"
                                >
                                    Remover
                                </button>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-lg text-green-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                                </div>
                                <div className="text-xs text-gray-400">Qtd: {item.quantity}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumo */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md border sticky top-20">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Resumo</h2>
                        
                        <div className="flex justify-between mb-2 text-gray-600">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.total)}</span>
                        </div>
                        
                        <div className="border-t my-4"></div>

                        <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cart.total)}</span>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg hover:shadow-green-500/30"
                        >
                            Finalizar Compra 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}