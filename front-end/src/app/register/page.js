"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../services/api"; 

export default function RegisterPage() {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "" 
    });
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Envia os dados para a rota de criação de usuários (Back-end)
            await api.post("/users", formData);

            alert("Cadastro realizado com sucesso! Faça login para continuar.");
            router.push("/login");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || "Erro ao cadastrar. Verifique os dados.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Crie sua Conta</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campo Nome */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Seu Nome"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Campo Email */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Senha</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="********"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Campo Role */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Tipo de Conta</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                            <option value="" disabled>Selecione uma opção...</option>
                            <option value="customer">Cliente </option>
                            <option value="seller">Vendedor </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 mt-4
                            ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                        Faça Login
                    </Link>
                </div>
            </div>
        </div>
    );
}