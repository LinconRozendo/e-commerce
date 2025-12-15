"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/auth"; 

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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
            await login(formData.email, formData.password);
             
        } catch (err) {
            console.error(err);
            setError("Falha no login. Verifique e-mail e senha.");
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Entrar</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">E-mail</label>
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

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Senha</label>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 
                            ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {loading ? "Entrando..." : "Acessar Conta"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Ainda não tem conta?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline font-medium">
                        Cadastre-se
                    </Link>
                </div>
            </div>
        </div>
    );
}