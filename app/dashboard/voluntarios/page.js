"use client";

import ChatConversacion from "@/components/ChatConversacion";
import DisponibilidadVoluntarios from "@/components/DisponibilidadVoluntarios";
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-200">
                <h1 className="text-3xl font-bold text-gray-700 animate-pulse drop-shadow-lg">
                    Cargando voluntarios...
                </h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-12 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-50 font-sans">
            <button
                onClick={() => router.push("/dashboard")}
                className="mb-8 inline-flex items-center gap-2 text-indigo-700 bg-indigo-200 hover:bg-indigo-300 active:bg-indigo-400 transition rounded-lg px-5 py-3 font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-400 select-none"
                aria-label="Volver al Dashboard principal"
            >
                ← Volver al Dashboard principal
            </button>

            <h1 className="text-5xl font-extrabold text-center text-indigo-900 mb-16 drop-shadow-lg">
                Voluntarios del Refugio
            </h1>

            <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
                {/* Panel voluntarios */}
                <aside className="w-full lg:w-1/3 bg-white rounded-3xl shadow-2xl border border-indigo-300 p-8 hover:shadow-indigo-400 transition-shadow select-none">
                    <h2 className="text-3xl font-semibold text-indigo-700 mb-8 border-b border-indigo-300 pb-3">
                        Selecciona un voluntario
                    </h2>

                    {voluntarios.length === 0 ? (
                        <p className="text-gray-600 italic text-center mt-12">
                            No hay voluntarios disponibles.
                        </p>
                    ) : (
                        <ul className="max-h-[520px] overflow-y-auto space-y-5 pr-3 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100">
                            {voluntarios.map((v) => (
                                <li key={v.id}>
                                    <button
                                        onClick={() => seleccionarVoluntario(v)}
                                        className={`w-full text-left px-6 py-4 rounded-2xl font-semibold text-lg transition-colors duration-250
                                            ${voluntarioSeleccionado?.id === v.id
                                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-400/40"
                                                : "bg-indigo-100 text-indigo-800 hover:bg-indigo-300"
                                            }
                                        `}
                                        aria-pressed={voluntarioSeleccionado?.id === v.id}
                                    >
                                        {v.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* Panel detalles */}
                <main className="w-full lg:w-2/3 bg-white rounded-3xl shadow-2xl border border-indigo-300 p-10 hover:shadow-indigo-400 transition-shadow min-h-[520px] flex flex-col select-text">
                    {voluntarioSeleccionado ? (
                        <>
                            <h2 className="text-4xl font-extrabold text-indigo-900 mb-8 drop-shadow-sm">
                                {voluntarioSeleccionado.name}
                            </h2>

                            <section className="mb-12">
                                <h3 className="text-2xl font-semibold text-gray-900 mb-6 border-b border-indigo-300 pb-3">
                                    Tareas pendientes
                                </h3>

                                {tareasPendientes.length > 0 ? (
                                    <ul className="space-y-5 max-h-52 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-indigo-100 rounded-lg">
                                        {tareasPendientes.map((t) => (
                                            <li
                                                key={t.id}
                                                className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 shadow-sm transition hover:scale-[1.02] hover:shadow-yellow-400/40 cursor-default"
                                            >
                                                <strong className="text-lg text-yellow-800 font-semibold">
                                                    {t.task_name}
                                                </strong>
                                                <p className="mt-1 text-yellow-700 italic">{t.description || "Sin descripción"}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic text-center">Sin tareas pendientes.</p>
                                )}

                                <DisponibilidadVoluntarios
                                    refugioId={refugio?.id}
                                    voluntarioId={voluntarioSeleccionado.id}
                                    onTareaAsignada={() => cargarTareas(voluntarioSeleccionado.id)}
                                />
                            </section>

                            {/* Chat */}
                            {refugio?.id && voluntarioSeleccionado?.id && (
                                <section className="mt-auto pt-6 border-t border-indigo-300">
                                    <h3 className="text-3xl font-semibold text-indigo-900 mb-6">
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
                        <p className="text-gray-600 italic text-center text-xl mt-24 select-none">
                            Selecciona un voluntario para ver sus tareas.
                        </p>
                    )}
                </main>
            </div>

            {/* Scrollbar personalizada para todo el sitio */}
            <style jsx global>{`
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: #e0e7ff;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #6366f1;
                    border-radius: 10px;
                    border: 2px solid #e0e7ff;
                }
                /* Firefox */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #6366f1 #e0e7ff;
                }
            `}</style>
        </div>
    );
}
