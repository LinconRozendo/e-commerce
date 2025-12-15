"use client";
import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "../services/api"; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    const router = useRouter();

    // Ao carregar a página, verifica se já existe token e recupera o usuário
    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            api.defaults.headers.Authorization = `Bearer ${token}`;
            api.get("/user")
                .then((res) => {
                    setUser(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    logout();
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    // Função de Login
    async function login(email, password) {
        try {
            const res = await api.post("/token", { email, password });
            const { token } = res.data;

            Cookies.set("token", token, { expires: 1 }); // Expira em 1 dia (no back-end o token expira em 1h)
            api.defaults.headers.Authorization = `Bearer ${token}`;
            
            // Busca dados do usuário imediatamente após pegar o token
            const userRes = await api.get("/user");
            setUser(userRes.data);
            
            router.push("/"); // Redireciona para Home
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    // Função de Logout
    function logout() {
        Cookies.remove("token");
        setUser(null);
        delete api.defaults.headers.Authorization;
        router.push("/login");
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);