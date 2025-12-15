"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../services/api"; 
import { useAuth } from "../../../contexts/auth"; 

export default function NewProductPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("manual"); 

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        url: "" 
    });
    const [loading, setLoading] = useState(false);

    const [csvFile, setCsvFile] = useState(null);

    // Lógica Manual
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/products", {
                ...formData,
                price: parseFloat(formData.price)
            });
            alert("Produto cadastrado com sucesso!");
            router.push("/");
        } catch (error) {
            alert("Erro ao cadastrar.");
        } finally {
            setLoading(false);
        }
    };

    // Lógica CSV
    const handleCsvSubmit = async (e) => {
        e.preventDefault();
        if (!csvFile) {
            alert("Selecione um arquivo CSV.");
            return;
        }

        const data = new FormData();
        data.append("file", csvFile); 

        setLoading(true);
        try {
            const res = await api.post("/products/upload", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            alert(res.data.message || "Importação concluída!");
            router.push("/");
        } catch (error) {
            console.error(error);
            alert("Erro na importação do CSV. Verifique o formato.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'seller') {
        return <div className="text-center mt-10">Acesso negado. Apenas vendedores.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-100 mb-20">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Cadastrar Produto</h1>

            
            <div className="flex border-b mb-6">
                <button 
                    onClick={() => setActiveTab("manual")}
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'manual' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Inserção Manual
                </button>
                <button 
                    onClick={() => setActiveTab("csv")}
                    className={`pb-2 px-4 font-medium transition ${activeTab === 'csv' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                >
                    Importar CSV 
                </button>
            </div>

            {/* --- Form manual --- */}
            {activeTab === "manual" && (
                <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Nome</label>
                        <input name="name" onChange={handleChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Descrição</label>
                        <textarea name="description" onChange={handleChange} required className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Preço (R$)</label>
                            <input type="number" step="0.01" name="price" onChange={handleChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">URL da Imagem</label>
                            <input type="text" name="url" onChange={handleChange} required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition mt-4">
                        {loading ? "Cadastrando..." : "Cadastrar Produto"}
                    </button>
                </form>
            )}

            {/* Form CSV --- */}
            {activeTab === "csv" && (
                <form onSubmit={handleCsvSubmit} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm text-blue-800">
                        <p className="font-bold mb-1">Modelo do Arquivo CSV:</p>
                        <p>O arquivo deve ter um cabeçalho com as colunas:</p>
                        <code className="bg-white px-2 py-1 rounded border mt-2 block">name,description,price,url</code>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-gray-500">
                            {csvFile ? (
                                <span className="text-green-600 font-bold">{csvFile.name}</span>
                            ) : (
                                <>
                                    <span className="text-3xl block mb-2"></span>
                                    <span>Clique ou arraste seu arquivo CSV aqui</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">
                        {loading ? "Processando..." : "Importar Produtos"}
                    </button>
                </form>
            )}
        </div>
    );
}