"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../contexts/auth";

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders");
            
            // Garantindo que seja sempre um array
            const lista = Array.isArray(res.data) ? res.data : (res.data.rows || []);
            setOrders(lista);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Formata data
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Formata moeda
    const formatMoney = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (loading || authLoading) {
        return <div className="text-center mt-20 text-gray-500 animate-pulse">Carregando histórico... 📜</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="max-w-4xl mx-auto mt-10 p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <h2 className="text-2xl font-bold text-gray-600 mb-2">Você ainda não fez pedidos</h2>
                <p className="text-gray-500 mb-6">Aproveite nossas ofertas e faça sua primeira compra!</p>
                <button 
                    onClick={() => router.push("/")}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Ir para a Loja
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-20">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Meus Pedidos</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                        {/* Cabeçalho do Pedido */}
                        <div className="bg-gray-100 p-4 flex flex-col md:flex-row justify-between text-sm text-gray-600">
                            <div>
                                <span className="font-bold block text-gray-800">PEDIDO #{order.id}</span>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="block text-gray-800 font-bold">Total</span>
                                <span>{formatMoney(order.total || 0)}</span>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="block text-gray-800 font-bold">Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold 'bg-green-100 text-green-700' `}>
                                    Concluído               
                                </span>
                            </div>
                        </div>

                        {/* Lista de Itens do Pedido */}
                        <div className="p-4 space-y-3">
                            {(order.products || []).map((product) => (
                                <div key={product.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                                    <div className="flex items-center space-x-4">
                                        {/* Imagem */}
                                        <div className="h-12 w-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            {product.url ? (
                                                <img src={product.url} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">Sem Foto</div>
                                            )}
                                        </div>
                                        
                                        {/* Detalhes */}
                                        <div>
                                            {/* Como é belongsToMany, o item é o produto */}
                                            <p className="font-medium text-gray-800">{product.name}</p>
                                            
                                            {/* Quantidade Fixa em 1, pois não temos quantidade em nenhum produto */}
                                            <p className="text-xs text-gray-500">Qtd: 1</p>
                                        </div>
                                    </div>
                                    
                                    {/* Preço Atual do Produto */}
                                    <div className="font-medium text-gray-700">
                                        {formatMoney(product.price)}
                                    </div>
                                </div>
                            ))}

                            {(!order.products || order.products.length === 0) && (
                                <p className="text-sm text-gray-400 italic">Detalhes dos itens não disponíveis.</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}