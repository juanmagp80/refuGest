"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEnvelope, FaHome, FaInfoCircle, FaLock, FaMapMarkerAlt, FaPaw, FaPhone } from "react-icons/fa";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        location: "",
        contact_info: "",
        description: "",
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 1. Registrar usuario
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        const user = signUpData.user;
        if (!user) {
            setError("No se pudo crear el usuario.");
            return;
        }

        // 2. Crear refugio asociado
        const { error: refugioError } = await supabase
            .from("refugios")
            .insert([
                {
                    name: form.name,
                    location: form.location,
                    contact_info: form.contact_info,
                    description: form.description,
                    user_id: user.id,
                },
            ]);

        if (refugioError) {
            setError(refugioError.message);
            return;
        }

        // 3. Redirigir al dashboard
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-fade-in">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col gap-6 border-2 border-blue-200 animate-slide-up"
            >
                <div className="flex flex-col items-center gap-2 mb-2">
                    <FaPaw className="text-4xl text-pink-500 drop-shadow" />
                    <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg">Registro de refugio</h1>
                    <p className="text-gray-500 text-sm">Crea tu cuenta y da de alta tu refugio</p>
                </div>
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
                    <input
                        name="email"
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-blue-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </div>
                <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-purple-400" />
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-purple-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    />
                </div>
                <div className="relative">
                    <FaHome className="absolute left-3 top-3 text-yellow-400" />
                    <input
                        name="name"
                        placeholder="Nombre del refugio"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-yellow-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                    />
                </div>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-green-400" />
                    <input
                        name="location"
                        placeholder="Ubicación"
                        value={form.location}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-green-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    />
                </div>
                <div className="relative">
                    <FaPhone className="absolute left-3 top-3 text-pink-400" />
                    <input
                        name="contact_info"
                        placeholder="Contacto"
                        value={form.contact_info}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-pink-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                </div>
                <div className="relative">
                    <FaInfoCircle className="absolute left-3 top-3 text-blue-300" />
                    <textarea
                        name="description"
                        placeholder="Descripción"
                        value={form.description}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-blue-100 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-300 transition min-h-[60px]"
                    />
                </div>
                {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Registrarse
                </button>
            </form>
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