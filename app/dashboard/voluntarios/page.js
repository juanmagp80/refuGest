"use client";

import AsignarTarea from "@/components/AsignarTarea";
import EnviarNotificacion from "@/components/EnviarNotificacion";
import RespuestasVoluntarios from "@/components/RespuestasVoluntarios";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function VoluntariosPage() {
    const [voluntarios, setVoluntarios] = useState(null);
    const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState(null);
    const [tareasPendientes, setTareasPendientes] = useState([]);
    const [refugio, setRefugio] = useState(null);
    const [respuestas, setRespuestas] = useState([]); // Definir el estado de respuestas

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

    const cargarRespuestas = async (voluntarioId) => { // Mover la función fuera de useEffect
        const { data, error } = await supabase
            .from("notificaciones")
            .select("id, mensaje, respuesta, respondida, created_at")  // Selecciona las columnas necesarias
            .eq("voluntario_id", voluntarioId)
            .eq("respondida", true);  // Solo obtenemos las notificaciones que han sido respondidas

        if (error) {
            console.error("Error cargando respuestas:", error);
        } else {
            setRespuestas(data);  // Guarda las respuestas en el estado
        }
    };

    const seleccionarVoluntario = (voluntario) => {
        setVoluntarioSeleccionado(voluntario);
        cargarTareas(voluntario.id);
        cargarRespuestas(voluntario.id);  // Llama a cargar las respuestas también
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
        <div className="min-h-screen p-8 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Voluntarios del Refugio</h1>

            <div className="flex gap-6">
                <div className="w-1/3 bg-white p-4 rounded-xl shadow-md border">
                    <h2 className="text-xl font-semibold mb-4 text-blue-700">Selecciona un voluntario</h2>
                    {voluntarios.length === 0 ? (
                        <p className="text-gray-500">No hay voluntarios disponibles.</p>
                    ) : (
                        <ul className="space-y-2">
                            {voluntarios.map((v) => (
                                <li key={v.id}>
                                    <button
                                        onClick={() => seleccionarVoluntario(v)}
                                        className={`w-full text-left px-4 py-2 rounded-lg hover:bg-blue-100 font-medium ${voluntarioSeleccionado?.id === v.id ? "bg-blue-200" : ""
                                            }`}
                                    >
                                        {v.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="w-2/3 bg-white p-6 rounded-xl shadow-md border">
                    {voluntarioSeleccionado ? (
                        <>
                            <h2 className="text-2xl font-bold text-green-700 mb-4">
                                {voluntarioSeleccionado.name}
                            </h2>

                            <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Tareas pendientes</h3>
                            <ul className="mb-4 space-y-2">
                                {tareasPendientes.length > 0 ? tareasPendientes.map((t) => (
                                    <li key={t.id} className="border p-3 rounded-md bg-yellow-50">
                                        <strong>{t.task_name}</strong><br />
                                        {t.description}
                                    </li>
                                )) : (
                                    <p className="text-gray-500">Sin tareas pendientes.</p>
                                )}
                            </ul>

                            <AsignarTarea
                                voluntarioId={voluntarioSeleccionado.id}
                                onTareaAsignada={() => cargarTareas(voluntarioSeleccionado.id)}
                            />

                            {refugio && (
                                <EnviarNotificacion
                                    voluntarioId={voluntarioSeleccionado.id}
                                    refugioId={refugio.id}
                                />
                            )}
                            <RespuestasVoluntarios respuestas={respuestas} />
                        </>
                    ) : (
                        <p className="text-gray-500 text-lg">Selecciona un voluntario para ver sus tareas.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
