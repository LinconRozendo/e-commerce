"use client";
import { useAuth } from "../../contexts/auth"; 
import { useCart } from "../../contexts/cart";
import api from "../../services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductCard({ product }) {
    const { user } = useAuth();
    const { fetchCartCount } = useCart();
    const router = useRouter();
    const [isFav, setIsFav] = useState(false);


    const isOwner = user && user.id == product.seller_id;

    const handleAddToCart = async () => {
        if (!user) {
            alert("Faça login para comprar!");
            router.push("/login");
            return;
        }

        try {
            await api.post("/cart", { productId: product.id });
            fetchCartCount();
            alert("Produto adicionado ao carrinho!");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                 const msg = error.response.data.msg || "Este produto já está no carrinho.";
                 alert(`${msg}`); 
            } else {      
                console.error(error);
                alert("Erro inesperado ao adicionar ao carrinho.");
            }
        }
    };

    const handleDelete = async () => {
        const confirm = window.confirm("Tem certeza que deseja excluir este produto?");
        if (!confirm) return;

        try {
            await api.delete(`/products/${product.id}`);
            alert("Produto excluído com sucesso!");
            window.location.reload(); 
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir produto.");
        }
    };

    // Formata o preço para R$
    const priceFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(product.price);


    const toggleFavorite = async (e) => {
        e.stopPropagation(); // Não abre os detalhes do produto
        
        if (!user) {
            alert("Faça login para favoritar!"); 
            return;
        }

        try {
            if (isFav) {
                await api.delete(`/favorites/${product.id}`);
                setIsFav(false); 
            } else {
                await api.post(`/favorites/${product.id}`);
                setIsFav(true); 
            }
        } catch (error) {
            console.error("Erro ao atualizar favorito:", error);
            alert("Erro ao atualizar status de favorito.");
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between h-full">
            {/* Imagem dinâmica */}
            <div 
                onClick={() => router.push(`/product/${product.id}`)} 
                className="h-48 bg-gray-100 rounded mb-4 flex items-center justify-center overflow-hidden relative cursor-pointer"
            >
                {product.url ? (
                    <img src={product.url} alt={product.name} className="object-cover h-full w-full hover:scale-105 transition-transform duration-300" />
                ) : (
                    <span className="text-gray-400">Sem Imagem</span>
                )}
                
                {isOwner && (
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        SEU
                    </span>
                )}

                {!isOwner && (
                    <button
                        onClick={toggleFavorite}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition z-10"
                        title="Favoritar"
                    >
                        {/* Se estiver favoritado mostra coração cheio, senão vazio */}
                        {isFav ? "❤️" : "🤍"}
                    </button>
                )}
            </div>

            {/* Informações */}
            <div className="mb-4">
                {/* Título dinâmico */}
                <h2 
                    onClick={() => router.push(`/product/${product.id}`)} // <--- NOVO
                    className="text-lg font-bold text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
                >
                    {product.name}
                </h2>
                
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="text-green-600 font-bold text-xl">{priceFormatted}</div>
            </div>

            {/* Se for o vendedor do produto mostra Editar/Excluir. Se for cliente mostra comprar. */}
            <div className="mt-auto">
                {isOwner ? (
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => router.push(`/product/${product.id}/edit`)}
                            className="bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded hover:bg-blue-600 hover:text-white transition font-medium"
                        >
                            Editar
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="bg-red-50 text-red-600 border border-red-200 py-2 rounded hover:bg-red-600 hover:text-white transition font-medium"
                        >
                            Excluir
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.sold}
                        className={`w-full py-2 rounded text-white font-medium transition-colors
                            ${product.sold ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    >
                        {product.sold ? "Esgotado" : "Adicionar ao Carrinho"}
                    </button>
                )}
            </div>
        </div>
    );
}