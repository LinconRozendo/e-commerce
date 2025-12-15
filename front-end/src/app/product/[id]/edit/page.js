"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../services/api"; 
import { useAuth } from "../../../../contexts/auth"; 

export default function EditProductPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams(); 
    const { id } = params;

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        url: ""
    });
    const [loading, setLoading] = useState(true);

    // Busca os dados do produto para preencher o formulário
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                // Verifica se retorna o objeto direto ou dentro de um array
                const product = Array.isArray(res.data) ? res.data[0] : res.data;
                
                // Verifica se quem está tentando editar é o vendedor do produto
                if (user && user.id != product.seller_id) {
                    alert("Você não tem permissão para editar este produto.");
                    router.push("/");
                    return;
                }

                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    url: product.url
                });
            } catch (error) {
                console.error("Erro ao buscar produto", error);
                alert("Produto não encontrado.");
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProduct();
        }
    }, [id, user, router]);

    // Lida com PUT
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${id}`, {
                ...formData,
                price: parseFloat(formData.price)
            });
            alert("Produto atualizado com sucesso!");
            router.push("/");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar produto.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading || authLoading) return <div className="text-center mt-20">Carregando editor...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-100 mt-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Produto</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Nome</label>
                    <input 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Descrição</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 h-24"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Preço (R$)</label>
                        <input 
                            type="number" 
                            name="price" 
                            step="0.01"
                            value={formData.price} 
                            onChange={handleChange} 
                            required 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">URL da Imagem</label>
                        <input 
                            type="text" 
                            name="url" 
                            value={formData.url} 
                            onChange={handleChange} 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button 
                        type="button"
                        onClick={() => router.push("/")}
                        className="w-1/3 bg-gray-200 text-gray-700 py-3 rounded font-bold hover:bg-gray-300 transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        className="w-2/3 bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
}