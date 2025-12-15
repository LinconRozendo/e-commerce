"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../services/api";
import { useAuth } from "../../contexts/auth";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        const confirm = window.confirm("Tem certeza? Essa ação não pode ser desfeita e você perderá acesso à conta.");
        
        if (confirm) {
            setLoading(true);
            try {
                await api.delete("/user"); 
                
                alert("Sua conta foi desativada. Sentiremos sua falta!");
                logout(); // Desloga o usuário 
            } catch (error) {
                console.error(error);
                alert("Erro ao excluir conta. Tente novamente.");
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-md border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Minha Conta</h1>

            <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-sm text-gray-500">Nome</label>
                    <div className="text-lg font-medium text-gray-900">{user.name}</div>
                </div>
                <div>
                    <label className="block text-sm text-gray-500">E-mail</label>
                    <div className="text-lg font-medium text-gray-900">{user.email}</div>
                </div>
                <div>
                    <label className="block text-sm text-gray-500">Tipo de Conta</label>
                    <div className="inline-block px-3 py-1 rounded bg-blue-100 text-blue-800 text-sm font-bold capitalize">
                        {user.role === 'seller' ? 'Vendedor' : 'Cliente'}
                    </div>
                </div>
            </div>

            <div className="border-t pt-6">
                <h2 className="text-xl font-bold text-red-600 mb-2">Exclusão de Conta</h2>
                <p className="text-gray-500 mb-4 text-sm">
                    Se você excluir sua conta, não poderá mais fazer login nem ver seu histórico de pedidos.
                </p>

                <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded hover:bg-red-600 hover:text-white transition-colors font-medium"
                >
                    {loading ? "Excluindo..." : "Excluir minha conta"}
                </button>
            </div>
        </div>
    );
}