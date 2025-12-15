"use client";
import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/productcard/productcard";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get("/products");

                let listaDados = [];

                // Dado que podemos ter um Objeto como resultado da busca com produto
                // com os produtos incluso nesse objeto, é necessário destrinchar o Objeto
                // para tenta encontrar o(s) produto(s)[Array] em vários lugares possíveis
                if (Array.isArray(res.data)) {
                    // A API devolveu o array direto (Ex: [ {...}, {...} ])
                    listaDados = res.data;
                } else if (res.data.rows && Array.isArray(res.data.rows)) {
                    // Sequelize padrão ou findAndCountAll (Ex: { count: 1, rows: [...] })
                    listaDados = res.data.rows;
                } else if (res.data.products && Array.isArray(res.data.products)) {
                    // API formatada (Ex: { products: [...] })
                    listaDados = res.data.products;
                } else if (res.data.data && Array.isArray(res.data.data)) {
                    // Wrapper genérico (Ex: { data: [...] })
                    listaDados = res.data.data;
                }

                if (listaDados.length > 0) {
                    setProducts(listaDados);
                } else {
                    console.warn("Nenhuma lista válida encontrada no objeto:", res.data);
                    setProducts([]);
                }

            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="text-center mt-20 text-gray-600">Carregando produtos...</div>;
    }

    return (
        <div>
            {/* Cabeçalho e busca */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Destaques</h1>
                    <p className="text-gray-500">Confira as últimas novidades da E-Commerce Shop</p>
                </div>

                {/* Campo de busca */}
                <div className="w-full md:w-1/3 relative">
                    <input 
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {/* Ícone de Lupa (Emoji ou SVG) */}
                    <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
            </div>

            {/* Renderização condicional */}
            {!Array.isArray(products) || products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-500">Nenhum produto cadastrado na loja.</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                // Caso tenha produtos na loja, mas a busca não retornou nada
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500">Nenhum produto encontrado para "<strong>{searchTerm}</strong>" 😕</p>
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Limpar busca
                    </button>
                </div>
            ) : (
                // Lista Filtrada
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}