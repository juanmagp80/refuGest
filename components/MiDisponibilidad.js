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
        <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Mi disponibilidad</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona un día y un rango horario para indicar tu disponibilidad.</p>

            <div className="flex gap-4 items-center mb-4">
                <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} className="border px-3 py-2 rounded" />
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="border px-3 py-2 rounded" />
                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="border px-3 py-2 rounded" />
                <button onClick={guardarDisponibilidad} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Guardar</button>
            </div>

            <ul className="space-y-2">
                {disponibilidad.map((item) => (
                    <li key={item.id} className="bg-blue-100 px-4 py-2 rounded shadow text-gray-800">
                        {item.dia} de {item.hora_inicio} a {item.hora_fin}
                    </li>
                ))}
            </ul>
        </div>
    );
}
