"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import VoluntarioDetalle from "./VoluntarioDetalle";

export default function VoluntariosDashboard({ refugioId }) {
    const [voluntarios, setVoluntarios] = useState([]);
    const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState(null);

    useEffect(() => {
        const fetchVoluntarios = async () => {
            const { data, error } = await supabase
                .from("voluntarios")
                .select("id, nombre")
                .eq("refugio_id", refugioId);

            if (error) console.error("Error al cargar voluntarios:", error);
            else setVoluntarios(data);
        };

        if (refugioId) fetchVoluntarios();
    }, [refugioId]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Voluntarios del refugio</h2>
            <select
                className="mb-6 w-full border px-4 py-2 rounded-lg text-black"
                onChange={(e) => {
                    const id = e.target.value;
                    const voluntario = voluntarios.find(v => v.id === id);
                    setVoluntarioSeleccionado(voluntario || null);
                }}
            >
                <option value="">Selecciona un voluntario</option>
                {voluntarios.map((v) => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
            </select>

            {voluntarioSeleccionado && (
                <VoluntarioDetalle voluntario={voluntarioSeleccionado} />
            )}
        </div>
    );
}
