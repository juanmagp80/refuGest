"use client";

import AsignarTarea from "@/components/AsignarTarea";
import ChatConversacion from "@/components/ChatConversacion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function VoluntariosPage() {
    const [voluntarios, setVoluntarios] = useState(null);
    const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState(null);
    const [tareasPendientes, setTareasPendientes] = useState([]);
    const [refugio, setRefugio] = useState(null);
    const router = useRouter();

    const [respuestas, setRespuestas] = useState([]);

    useEffect(() => {
        const cargarVoluntarios = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setVoluntarios([]);
                return;
            }

            const { data: refugioData } = await supabase
                .from("refugios")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!refugioData) {
                setVoluntarios([]);
                return;
            }

            setRefugio(refugioData);

            const { data: listaVoluntarios } = await supabase
                .from("voluntarios")
                .select("id, name")
                .eq("refugio_id", refugioData.id);

            setVoluntarios(listaVoluntarios || []);
        };

        cargarVoluntarios();
    }, []);

    const cargarRespuestas = async (voluntarioId) => {
        const { data, error } = await supabase
            .from("notificaciones")
            .select("id, mensaje, respuesta, respondida, created_at")
            .eq("voluntario_id", voluntarioId)
            .eq("respondida", true);

        if (error) {
            console.error("Error cargando respuestas:", error);
        } else {
            setRespuestas(data);
        }
    };

    const seleccionarVoluntario = (voluntario) => {
        setVoluntarioSeleccionado(voluntario);
        cargarTareas(voluntario.id);
        cargarRespuestas(voluntario.id);
    };

    const cargarTareas = async (voluntarioId) => {
        const { data, error } = await supabase
            .from("tareas_voluntarios")
            .select("*")
            .eq("volunteer_id", voluntarioId)
            .eq("status", "Pendiente"); // 👈 Usa la capitalización correcta

        if (error) {
            console.error("Error cargando tareas:", error);
            setTareasPendientes([]);
        } else {
            console.log("🔎 Tareas devueltas:", data);
            setTareasPendientes(data);
        }
    };






    if (voluntarios === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100">
                <h1 className="text-2xl font-semibold text-gray-700 animate-pulse">Cargando voluntarios...</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-10 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100">
            <button
                onClick={() => router.push("/dashboard")} // Ajusta la ruta aquí
                className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
            >
                ← Volver al Dashboard principal
            </button>
            <h1 className="text-4xl font-extrabold text-blue-800 mb-12 text-center drop-shadow-lg">
                Voluntarios del Refugio
            </h1>

            <div className="flex gap-10 max-w-7xl mx-auto">
                {/* Panel de voluntarios */}
                <div className="w-1/3 bg-white/90 rounded-3xl shadow-2xl border-2 border-blue-300 p-8 hover:shadow-xl transition-shadow">
                    <h2 className="text-2xl font-bold mb-6 text-blue-700">Selecciona un voluntario</h2>
                    {voluntarios.length === 0 ? (
                        <p className="text-gray-600">No hay voluntarios disponibles.</p>
                    ) : (
                        <ul className="space-y-5 max-h-[480px] overflow-y-auto pr-2">
                            {voluntarios.map((v) => (
                                <li key={v.id}>
                                    <button
                                        onClick={() => seleccionarVoluntario(v)}
                                        className={`w-full text-left px-5 py-4 rounded-2xl transition-colors duration-200 font-semibold text-lg
                                            ${voluntarioSeleccionado?.id === v.id
                                                ? "bg-blue-400 text-white shadow-lg"
                                                : "bg-blue-100 text-blue-900 hover:bg-blue-300"
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detalles del voluntario */}
                <div className="w-2/3 bg-white/90 rounded-3xl shadow-2xl border-2 border-blue-300 p-8 hover:shadow-xl transition-shadow min-h-[480px]">
                    {voluntarioSeleccionado ? (
                        <>
                            <h2 className="text-3xl font-extrabold text-blue-700 mb-6 drop-shadow-sm">
                                {voluntarioSeleccionado.name}
                            </h2>

                            <section className="mb-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Tareas pendientes</h3>
                                {tareasPendientes.length > 0 ? (
                                    <ul className="space-y-4 max-h-48 overflow-y-auto pr-2">
                                        {tareasPendientes.map((t) => (
                                            <li
                                                key={t.id}
                                                className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-sm hover:shadow-md transition transform hover:scale-[1.03]"
                                            >
                                                <strong>{t.task_name}</strong>
                                                <p className="mt-1 text-gray-700">{t.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">Sin tareas pendientes.</p>
                                )}
                                <AsignarTarea

                                    refugioId={refugio?.id}
                                    voluntarioId={voluntarioSeleccionado.id}
                                    onTareaAsignada={() => cargarTareas(voluntarioSeleccionado.id)}
                                />
                            </section>

                            {/* Chat */}
                            {refugio?.id && voluntarioSeleccionado?.id && (
                                <section className="mt-6">
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                        Chat con el voluntario
                                    </h3>
                                    <ChatConversacion
                                        refugioId={refugio.id}
                                        voluntarioId={voluntarioSeleccionado.id}
                                        remitente="refugio"
                                    />
                                </section>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-600 text-lg italic select-none">
                            Selecciona un voluntario para ver sus tareas.
                        </p>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease;
                }
            `}</style>
        </div>
    );
}
