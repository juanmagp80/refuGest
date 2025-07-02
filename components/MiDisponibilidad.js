"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function MiDisponibilidad({ voluntarioId }) {
    const [dia, setDia] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");
    const [disponibilidad, setDisponibilidad] = useState([]);

    useEffect(() => {
        if (voluntarioId) {
            cargarDisponibilidad();
        }
    }, [voluntarioId]);

    const cargarDisponibilidad = async () => {
        const { data, error } = await supabase
            .from("disponibilidad_voluntarios")
            .select("*")
            .eq("volunteer_id", voluntarioId)
            .order("dia", { ascending: true });

        if (!error) setDisponibilidad(data);
    };

    const guardarDisponibilidad = async () => {
        if (!dia || !horaInicio || !horaFin) return;

        const { error } = await supabase.from("disponibilidad_voluntarios").insert({
            volunteer_id: voluntarioId,
            dia,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
        });

        if (!error) {
            setDia("");
            setHoraInicio("");
            setHoraFin("");
            cargarDisponibilidad();
        }
    };

    return (
        <div className="mt-6 max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center select-none">Mi disponibilidad</h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
                Selecciona un día y un rango horario para indicar tu disponibilidad.
            </p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    guardarDisponibilidad();
                }}
                className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6"
            >
                <input
                    type="date"
                    value={dia}
                    onChange={(e) => setDia(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                />
                <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                />
                <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition"
                >
                    Guardar
                </button>
            </form>

            <ul className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
                {disponibilidad.length === 0 ? (
                    <p className="text-center text-gray-500 select-none">No has añadido ninguna disponibilidad aún.</p>
                ) : (
                    disponibilidad.map((item) => (
                        <li
                            key={item.id}
                            className="bg-blue-50 text-blue-900 rounded-md px-4 py-3 shadow-sm flex justify-between items-center select-text"
                        >
                            <span>
                                <strong>{item.dia}</strong> — de {item.hora_inicio} a {item.hora_fin}
                            </span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
