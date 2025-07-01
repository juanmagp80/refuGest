"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AsignarTarea({ voluntarioId }) {
    const [form, setForm] = useState({
        task_name: "",
        description: ""
    });

    const [mensaje, setMensaje] = useState(null);

    // Log voluntarioId para debug
    useEffect(() => {
        console.log("voluntarioId recibido en AsignarTarea:", voluntarioId);
    }, [voluntarioId]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.task_name || !voluntarioId) {
            setMensaje("Por favor, completa todos los campos.");
            return;
        }

        console.log("Insertando tarea con datos:", {
            volunteer_id: voluntarioId,
            task_name: form.task_name,
            description: form.description,
            assigned_at: new Date().toISOString()
        });

        const { data, error } = await supabase
            .from("tareas_voluntarios")
            .insert([{
                volunteer_id: voluntarioId,
                task_name: form.task_name,
                description: form.description,
                assigned_at: new Date().toISOString(),
                status: "Pendiente" // 👈 Usa el valor exacto
            }]);

        console.log("Respuesta de insert:", { data, error });

        if (error) {
            console.error("Error al asignar tarea:", error);
            setMensaje("Error al asignar la tarea.");
        } else {
            setMensaje("✅ Tarea asignada correctamente.");
            setForm({ task_name: "", description: "" });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 bg-white p-6 rounded-lg shadow-md border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 text-indigo-700">Asignar nueva tarea</h3>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Título de la tarea</label>
                <input
                    type="text"
                    name="task_name"
                    value={form.task_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej. Pasear perros"
                    required
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Descripción</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Ej. Pasear a los perros de la zona B del refugio durante 30 minutos"
                />
            </div>

            <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-bold transition-all duration-200"
            >
                Asignar tarea
            </button>

            {mensaje && (
                <p className={`mt-3 text-sm ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                    {mensaje}
                </p>
            )}
        </form>
    );
}
