"use client";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaLock, FaPaw } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError(error.message);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-fade-in">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col gap-6 border-2 border-blue-200 animate-slide-up"
            >
                <div className="flex flex-col items-center gap-2 mb-2">
                    <FaPaw className="text-4xl text-pink-500 drop-shadow" />
                    <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg">Iniciar sesión</h1>
                    <p className="text-gray-500 text-sm">Accede a tu refugio y gestiona tus animales</p>
                </div>
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 border-2 border-blue-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </div>
                <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-purple-400" />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 border-2 border-purple-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    />
                </div>
                {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Entrar
                </button>
            </form>
            <p className="mt-6 text-center text-gray-700">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-pink-600 underline font-bold hover:text-pink-800 transition">
                    Regístrate aquí
                </Link>
            </p>
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease;
                }
                @keyframes slide-up {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s cubic-bezier(.4,2,.6,1) 0.1s both;
                }
            `}</style>
        </div>
    );
}