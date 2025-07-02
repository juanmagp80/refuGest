"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MisTareas() {
    const [tareas, setTareas] = useState(null);

    useEffect(() => {
        const cargarTareas = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: voluntario } = await supabase
                .from("voluntarios")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!voluntario) return;

            const { data: tareasAsignadas } = await supabase
                .from("tareas_voluntarios")
                .select("*")
                .eq("volunteer_id", voluntario.id)
                .order("assigned_at", { ascending: false });

            setTareas(tareasAsignadas || []);
        };

        cargarTareas();
    }, []);

    const actualizarEstado = async (id, nuevoEstado) => {
        await supabase.from("tareas_voluntarios").update({ status: nuevoEstado }).eq("id", id);
        setTareas((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: nuevoEstado } : t))
        );
    };

    const eliminarTarea = async (id) => {
        if (!confirm("¿Eliminar esta tarea completada?")) return;
        await supabase.from("tareas_voluntarios").delete().eq("id", id);
        setTareas((prev) => prev.filter((t) => t.id !== id));
    };

    if (!tareas) {
        return <p className="text-gray-600 mt-6">Cargando tareas...</p>;
    }

    const tareasPendientes = tareas.filter(t => t.status !== "Completada");
    const tareasCompletadas = tareas.filter(t => t.status === "Completada");

    const formatoHora = (h) => h?.slice(0, 5) || '--';

    return (
        <div className="mt-10 bg-gradient-to-br from-yellow-100 via-white to-green-50 rounded-3xl shadow-2xl p-10 border-[3px] border-yellow-300 animate-fade-in">
            <h2 className="text-3xl font-extrabold text-yellow-800 mb-6 flex items-center gap-2">
                🧹 Tareas asignadas
            </h2>

            {tareasPendientes.map((tarea) => (
                <div
                    key={tarea.id}
                    className="bg-yellow-50 border-l-[6px] border-yellow-500 rounded-xl p-5 shadow-lg hover:shadow-yellow-300 transition-all duration-300"
                >
                    <h3 className="text-xl font-bold text-yellow-800 mb-1">{tarea.task_name}</h3>
                    {tarea.description && <p className="text-gray-700 mb-2">{tarea.description}</p>}

                    {tarea.dia && (
                        <p className="text-sm text-gray-600 mb-1">
                            🗓️ {tarea.dia} — {formatoHora(tarea.hora_inicio)} a {formatoHora(tarea.hora_fin)}
                        </p>
                    )}
                    <p className="text-sm text-gray-400 mb-3">
                        📌 Asignada el {new Date(tarea.assigned_at).toLocaleDateString()}
                    </p>

                    {tarea.status === "Por aceptar" ? (
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => actualizarEstado(tarea.id, "Pendiente")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                            >
                                ✅ Aceptar
                            </button>
                            <button
                                onClick={() => eliminarTarea(tarea.id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                            >
                                ❌ Rechazar
                            </button>
                        </div>
                    ) : (
                        <select
                            value={tarea.status}
                            onChange={(e) => actualizarEstado(tarea.id, e.target.value)}
                            className="bg-white border border-yellow-300 text-yellow-900 font-semibold rounded px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            <option value="Pendiente">⏳ Pendiente</option>
                            <option value="En progreso">🚧 En progreso</option>
                            <option value="Completada">✅ Completada</option>
                        </select>
                    )}
                </div>
            ))}

            {tareasCompletadas.length > 0 && (
                <>
                    <h3 className="text-2xl font-semibold text-green-700 mb-4 flex items-center gap-2">
                        ✅ Tareas completadas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {tareasCompletadas.map((tarea) => (
                            <div
                                key={tarea.id}
                                className="bg-green-50 border-l-[6px] border-green-500 rounded-xl p-5 shadow-lg hover:shadow-green-300 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <h4 className="text-lg font-bold text-green-800">{tarea.task_name}</h4>
                                    {tarea.description && (
                                        <p className="text-sm text-green-700 mb-1">{tarea.description}</p>
                                    )}
                                    {tarea.dia && (
                                        <p className="text-sm text-gray-600">
                                            🗓️ {tarea.dia} — {formatoHora(tarea.hora_inicio)} a {formatoHora(tarea.hora_fin)}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Completada el {new Date(tarea.assigned_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => eliminarTarea(tarea.id)}
                                    className="mt-4 self-end text-red-600 text-sm font-medium hover:underline hover:text-red-800 transition"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
