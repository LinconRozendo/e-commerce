"use client";
import Link from "next/link";
import { useAuth } from "../../contexts/auth"; 
import { useCart } from "../../contexts/cart";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart(); 

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                
                <Link href="/" className="text-xl font-bold hover:text-gray-300">
                    E-Commerce Shop
                </Link>
                
                <div className="flex items-center space-x-6">
                    {/* Verifica se tem usuário logado */}
                    {user ? (
                        <>
                            <span className="text-sm text-gray-300 hidden md:inline">
                                Olá, <strong>{user.name}</strong>
                            </span>
                            
                            {/* Botão de Vender (Vendedores) */}
                            {user.role === 'seller' && (
                                <Link href="/product/register" className="text-sm bg-green-600 px-3 py-1 rounded hover:bg-green-700">
                                    Vender
                                </Link>
                                
                            )}

                            {user && user.role === 'seller' && (
                                <Link href="/dashboard" className="hover:text-purple-400 font-bold">
                                    Dashboard
                                </Link>
                            )}

                            <Link href="/cart" className="relative hover:text-yellow-400 flex items-center">
                                Carrinho
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-gray-900">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            
                            <Link href="/order" className="hover:text-blue-400">
                                Meus Pedidos
                            </Link>

                            <Link href="/favorites" className="hover:text-red-400">
                                Favoritos 
                            </Link>

                           
                            <Link href="/profile" className="hover:text-blue-400">
                                Perfil
                            </Link>

                            <button 
                                onClick={logout} 
                                className="text-red-400 hover:text-red-300 text-sm border border-red-400 px-3 py-1 rounded hover:bg-red-400 hover:text-white transition"
                            >
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link 
                            href="/login" 
                            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}