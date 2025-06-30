"use client";

import ChatConversacion from "@/components/ChatConversacion";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function VoluntariosPage() {
    const [voluntarios, setVoluntarios] = useState(null);
    const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState(null);
    const [tareasPendientes, setTareasPendientes] = useState([]);
    const [refugio, setRefugio] = useState(null);
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
            .eq("volunteer_id", voluntarioId);

        if (error) {
            console.error("Error cargando tareas:", error);
            setTareasPendientes([]);
        } else {
            setTareasPendientes(data);
        }
    };

    if (voluntarios === null) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Voluntarios del Refugio</h1>
                <p>Cargando voluntarios...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-200 via-purple-300 to-blue-400">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-10 text-center drop-shadow-lg">
                Voluntarios del Refugio
            </h1>

            <div className="flex gap-10">
                {/* Panel de Voluntarios */}
                <div className="w-1/3 bg-white p-8 rounded-2xl shadow-2xl border-2 border-gray-300 hover:shadow-xl transition-all">
                    <h2 className="text-2xl font-semibold mb-6 text-indigo-600">Selecciona un voluntario</h2>
                    {voluntarios.length === 0 ? (
                        <p className="text-gray-500">No hay voluntarios disponibles.</p>
                    ) : (
                        <ul className="space-y-6">
                            {voluntarios.map((v) => (
                                <li key={v.id}>
                                    <button
                                        onClick={() => seleccionarVoluntario(v)}
                                        className={`w-full text-left px-6 py-4 rounded-xl transition-transform duration-200 transform hover:bg-indigo-100 font-medium text-xl ${voluntarioSeleccionado?.id === v.id ? "bg-indigo-200" : ""
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detalles del Voluntario */}
                <div className="w-2/3 bg-white p-8 rounded-2xl shadow-2xl border-2 border-gray-300 hover:shadow-xl transition-all">
                    {voluntarioSeleccionado ? (
                        <>
                            <h2 className="text-3xl font-extrabold text-indigo-700 mb-6">
                                {voluntarioSeleccionado.name}
                            </h2>

                            {/* Tareas Pendientes */}
                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-4">Tareas pendientes</h3>
                            <ul className="mb-6 space-y-4">
                                {tareasPendientes.length > 0 ? tareasPendientes.map((t) => (
                                    <li key={t.id} className="border p-5 rounded-2xl bg-yellow-50 shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
                                        <strong>{t.task_name}</strong><br />
                                        {t.description}
                                    </li>
                                )) : (
                                    <p className="text-gray-500">Sin tareas pendientes.</p>
                                )}
                            </ul>

                            {/* Chat con el voluntario */}
                            {refugio?.id && voluntarioSeleccionado?.id && (
                                <div className="mt-8">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Chat con el voluntario</h2>
                                    <ChatConversacion
                                        refugioId={refugio.id}
                                        voluntarioId={voluntarioSeleccionado.id}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 text-lg">Selecciona un voluntario para ver sus tareas.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
