"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../contexts/auth";
import ProductCard from "../../components/productcard/productcard";

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        const fetchFavorites = async () => {
            try {
                const res = await api.get("/favorites");
                

                let lista = [];
                if (Array.isArray(res.data)) lista = res.data;
                else if (res.data.rows) lista = res.data.rows;
                else if (res.data.products) lista = res.data.products; 
                
                setFavorites(lista);
            } catch (error) {
                console.error("Erro ao buscar favoritos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchFavorites();
    }, [user, authLoading, router]);

    if (loading || authLoading) return <div className="text-center mt-20 text-gray-500">Carregando favoritos... ❤️</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-20">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Meus Favoritos</h1>
            <p className="text-gray-500 mb-8">Produtos que você marcou como Favoritos</p>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-500">Sua lista de desejos está vazia.</p>
                    <button 
                        onClick={() => router.push("/")}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Explorar Produtos
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}