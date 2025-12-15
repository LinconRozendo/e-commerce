"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../services/api"; 
import { useAuth } from "../../../contexts/auth";
import { useCart } from "../../../contexts/cart";

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    
    const { user } = useAuth();
    const { fetchCartCount } = useCart();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);

                const data = Array.isArray(res.data) ? res.data[0] : res.data;
                setProduct(data);
            } catch (error) {
                console.error(error);
                alert("Produto não encontrado.");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, router]);

    const handleAddToCart = async () => {
        if (!user) {
            router.push("/login");
            return;
        }
        try {
            await api.post("/cart", { productId: product.id });
            fetchCartCount();
            alert("Produto adicionado ao carrinho!");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                 alert(`${error.response.data.msg || "Já está no carrinho."}`);
            } else {
                alert("Erro ao adicionar.");
            }
        }
    };

    if (loading) return <div className="text-center mt-20">Carregando detalhes...</div>;
    if (!product) return null;

    const isOwner = user && user.id == product.seller_id;
    const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <button 
                onClick={() => router.back()} 
                className="text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-2"
            >
                Voltar
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Imagem grande */}
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-80 md:h-96">
                    {product.url ? (
                        <img src={product.url} alt={product.name} className="object-cover h-full w-full" />
                    ) : (
                        <span className="text-gray-400">Sem Imagem</span>
                    )}
                </div>

                {/* Detalhes e Ações */}
                <div className="flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        <p className="text-gray-500 text-sm mb-4">Vendido por ID: {product.seller_id}</p>
                        
                        <div className="text-3xl font-bold text-green-600 mb-6">{priceFormatted}</div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                            <h3 className="font-bold text-gray-700 mb-2">Descrição</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                        </div>
                    </div>

                    <div>
                        {isOwner ? (
                            <button 
                                onClick={() => router.push(`/product/${product.id}/edit`)}
                                className="w-full bg-blue-100 text-blue-700 py-3 rounded-lg font-bold hover:bg-blue-200 transition"
                            >
                                Editar Meu Produto 
                            </button>
                        ) : (
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.sold}
                                className={`w-full py-3 rounded-lg text-white font-bold text-lg shadow-md transition
                                    ${product.sold ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:shadow-lg"}`}
                            >
                                {product.sold ? "Esgotado" : "Comprar Agora"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}