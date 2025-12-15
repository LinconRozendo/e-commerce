"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../contexts/auth"; 

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/login");
                return;
            }
            if (user.role !== 'seller') {
                alert("Acesso restrito a vendedores.");
                router.push("/");
                return;
            }
            fetchDashboard();
        }
    }, [user, authLoading, router]);

    const fetchDashboard = async () => {
        try {
            const res = await api.get("/dashboard");
            setStats(res.data);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return <div className="text-center mt-20 text-gray-500 animate-pulse">Calculando resultados...</div>;
    }

    if (!stats) return null;

    return (
        <div className="max-w-6xl mx-auto mt-10 mb-20 px-4">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Painel do Vendedor</h1>
                    <p className="text-gray-500">Visão geral do seu desempenho</p>
                </div>
                <button 
                    onClick={() => router.push("/product/register")}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow"
                >
                    + Novo Produto
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Faturamento */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Faturamento Total</p>
                        <h2 className="text-3xl font-bold text-green-600 mt-2">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.total_revenue)}
                        </h2>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Soma de todas as vendas</div>
                </div>

                {/* Vendas realizadas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Produtos Vendidos</p>
                        <h2 className="text-3xl font-bold text-blue-600 mt-2">{stats.total_sold}</h2>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Itens concluídos</div>
                </div>

                {/* Produtos ativos */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Produtos Cadastrados</p>
                        <h2 className="text-3xl font-bold text-gray-700 mt-2">{stats.total_products}</h2>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Total no inventário (Vendido + Estoque)</div>
                </div>

                {/* Campeão de vendas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Mais Vendido</p>
                        <h2 className="text-xl font-bold text-purple-600 mt-2 line-clamp-2">
                            {stats.best_selling_product}
                        </h2>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">Item mais popular por nome</div>
                </div>

            </div>

            <div className="mt-12 bg-blue-50 p-6 rounded-lg border border-blue-100 text-blue-800">
                <h3 className="font-bold text-lg mb-2">Dica para vender mais</h3>
                <p>Mantenha os títulos dos seus produtos claros e use boas imagens. Produtos com descrições detalhadas têm 30% mais chance de venda!</p>
            </div>
        </div>
    );
}