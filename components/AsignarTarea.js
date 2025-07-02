"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function AsignarTarea({ voluntarioId }) {
    const [form, setForm] = useState({
        task_name: "",
        description: ""
    });

    const [mensaje, setMensaje] = useState(null);

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

        const { data, error } = await supabase
            .from("tareas_voluntarios")
            .insert([{
                volunteer_id: voluntarioId,
                task_name: form.task_name,
                description: form.description,
                assigned_at: new Date().toISOString(),
                status: "Pendiente"
            }]);

        if (error) {
            console.error("Error al asignar tarea:", error);
            setMensaje("Error al asignar la tarea.");
        } else {
            setMensaje("✅ Tarea asignada correctamente.");
            setForm({ task_name: "", description: "" });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-md mx-auto"
        >
            <h3 className="text-xl font-bold mb-4 text-indigo-700 text-center">Asignar nueva tarea</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la tarea
                </label>
                <input
                    type="text"
                    name="task_name"
                    value={form.task_name}
                    onChange={handleChange}
                    placeholder="Ej. Pasear perros"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ej. Pasear a los perros de la zona B durante 30 minutos"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md text-sm transition"
            >
                Asignar tarea
            </button>

            {mensaje && (
                <p className={`mt-4 text-sm text-center ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                    {mensaje}
                </p>
            )}
        </form>
    );
}
