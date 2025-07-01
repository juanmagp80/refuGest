"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function DashboardRefugio({ refugio }) {
    const [voluntariosCount, setVoluntariosCount] = useState(0);
    const [animalesCount, setAnimalesCount] = useState(0);
    const [tareasCount, setTareasCount] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            setLoading(true);

            const { count: voluntarios, error: errV } = await supabase
                .from("voluntarios")
                .select("id", { count: "exact", head: true })
                .eq("refugio_id", refugio.id);

            const { count: animales, error: errA } = await supabase
                .from("animales")
                .select("id", { count: "exact", head: true })
                .eq("refugio_id", refugio.id);

            const { count: tareas, error: errT } = await supabase
                .from("tareas_voluntarios")
                .select("id", { count: "exact", head: true })
                .eq("refugio_id", refugio.id);

            if (!errV) setVoluntariosCount(voluntarios || 0);
            if (!errA) setAnimalesCount(animales || 0);
            if (!errT) setTareasCount(tareas || 0);

            setLoading(false);
        }
        fetchCounts();
    }, [refugio.id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    if (loading) return <p className="text-center mt-10">Cargando resumen del refugio...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100 p-10">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-blue-300">
                <h1 className="text-4xl font-extrabold mb-4 text-blue-700">{refugio.name}</h1>
                <p className="mb-4 text-gray-800">{refugio.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-10">
                    <div className="bg-blue-100 rounded-xl p-6 shadow">
                        <h2 className="text-2xl font-bold text-blue-700">{voluntariosCount}</h2>
                        <p className="text-blue-900 font-semibold">Voluntarios</p>
                    </div>
                    <div className="bg-purple-100 rounded-xl p-6 shadow">
                        <h2 className="text-2xl font-bold text-purple-700">{animalesCount}</h2>
                        <p className="text-purple-900 font-semibold">Animales</p>
                    </div>
                    <div className="bg-pink-100 rounded-xl p-6 shadow">
                        <h2 className="text-2xl font-bold text-pink-700">{tareasCount}</h2>
                        <p className="text-pink-900 font-semibold">Tareas asignadas</p>
                    </div>
                </div>

                <p className="mb-6 text-gray-800">
                    <strong>Ubicación:</strong> {refugio.location}
                </p>
                <p className="mb-6 text-gray-800">
                    <strong>Contacto:</strong> {refugio.contact_info}
                </p>

                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}
