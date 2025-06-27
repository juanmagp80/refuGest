"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MisTareas() {
    const [tareas, setTareas] = useState(null);
    const [voluntarioId, setVoluntarioId] = useState(null);

    useEffect(() => {
        const cargarTareas = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: voluntario, error: voluntarioError } = await supabase
                .from("voluntarios")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (voluntarioError || !voluntario) {
                console.error("No se encontró el voluntario:", voluntarioError);
                return;
            }

            setVoluntarioId(voluntario.id);

            const { data: tareasAsignadas, error: tareasError } = await supabase
                .from("tareas_voluntarios")
                .select("*")
                .eq("volunteer_id", voluntario.id)
                .eq("status", "Pendiente");

            if (tareasError) {
                console.error("Error al obtener tareas:", tareasError);
                return;
            }

            setTareas(tareasAsignadas || []);
        };

        cargarTareas();
    }, []);

    const marcarComoCompletada = async (tareaId) => {
        const { error } = await supabase
            .from("tareas_voluntarios")
            .update({ status: "Completada" })
            .eq("id", tareaId);

        if (error) {
            console.error("Error al marcar tarea como completada:", error);
            return;
        }

        // Remover la tarea localmente
        setTareas((prev) => prev.filter((t) => t.id !== tareaId));
    };

    if (tareas === null) {
        return <p className="text-gray-600 mt-6">Cargando tareas...</p>;
    }

    return (
        <div className="mt-10 bg-white/90 rounded-3xl shadow-xl p-8 border-2 border-yellow-200 animate-fade-in">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">🧹 Tareas asignadas</h2>
            {tareas.length === 0 ? (
                <p className="text-gray-500">No tienes tareas asignadas por el momento.</p>
            ) : (
                <ul className="space-y-4">
                    {tareas.map((tarea) => (
                        <li
                            key={tarea.id}
                            className="flex justify-between items-start p-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-100 shadow-md"
                        >
                            <div>
                                <p className="text-lg font-semibold text-yellow-800">{tarea.task_name}</p>
                                <p className="text-gray-700">{tarea.description}</p>
                            </div>
                            <button
                                onClick={() => marcarComoCompletada(tarea.id)}
                                className="ml-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-transform hover:scale-105"
                            >
                                ✅ Completar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
