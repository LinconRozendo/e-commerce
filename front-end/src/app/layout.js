import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/auth"; 
import { CartProvider } from "../contexts/cart";
import Navbar from "../components/navbar/navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-Commerce",
  description: "Loja Virtual Fullstack",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="container mx-auto p-6 flex-grow">
                    {children}
                </main>
                <footer className="bg-gray-800 text-gray-400 text-center p-4 text-sm">
                    &copy; 2025 E-Commerce
                </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}