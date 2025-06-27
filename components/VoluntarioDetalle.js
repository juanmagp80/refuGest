import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import AsignarTarea from "./AsignarTarea";

export default function VoluntarioDetalle({ voluntario }) {
    const [tareas, setTareas] = useState([]);
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        const fetchDatos = async () => {
            const { data: tareasData } = await supabase
                .from("tareas_voluntarios")
                .select("*")
                .eq("volunteer_id", voluntario.id)
                .is("completed_at", null);

            const { data: historialData } = await supabase
                .from("actividades_voluntarios")
                .select("*")
                .eq("volunteer_id", voluntario.id);

            setTareas(tareasData || []);
            setHistorial(historialData || []);
        };

        fetchDatos();
    }, [voluntario.id]);

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Tareas pendientes</h3>
            {tareas.length === 0 ? (
                <p className="text-gray-600">No hay tareas pendientes.</p>
            ) : (
                <ul className="space-y-2">
                    {tareas.map((tarea) => (
                        <li key={tarea.id} className="bg-gray-100 p-4 rounded-lg">
                            <strong>{tarea.task_name}</strong>
                            <p>{tarea.description}</p>
                        </li>
                    ))}
                </ul>
            )}

            <h3 className="text-xl font-semibold text-blue-700 mt-6 mb-2">Historial de tareas completadas</h3>
            {historial.length === 0 ? (
                <p className="text-gray-600">Sin historial todavía.</p>
            ) : (
                <ul className="space-y-2">
                    {historial.map((act) => (
                        <li key={act.id} className="bg-white p-4 rounded-lg shadow">
                            <strong>{act.task_name}</strong> –{" "}
                            <span className="text-sm text-gray-500">
                                Completada el {new Date(act.completed_at).toLocaleDateString()}
                            </span>
                            <p>{act.description}</p>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6">
                <AsignarTarea voluntarioId={voluntario.id} />
            </div>
        </div>
    );
}
