"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function DisponibilidadVoluntarios({ refugioId }) {
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroNombre, setFiltroNombre] = useState("");

    useEffect(() => {
        if (refugioId) {
            console.log("Cargando disponibilidad...");
            cargarDisponibilidad();
        }
    }, [refugioId]);


    const cargarDisponibilidad = async () => {
        const { data, error } = await supabase
            .from("disponibilidad_voluntarios")
            .select(`
                id,
                dia,
                hora_inicio,
                hora_fin,
                volunteer_id,
                voluntarios ( id, name, refugio_id )
            `)
            .order("dia", { ascending: true });

        if (error) {
            console.error("Error cargando disponibilidad:", error.message);
        } else {
            const filtrados = data.filter(d => d.voluntarios?.refugio_id === refugioId);
            setDisponibilidad(filtrados);
        }
    };

    const disponibilidadFiltrada = disponibilidad.filter((d) => {
        const coincideDia = filtroDia ? d.dia === filtroDia : true;
        const coincideNombre = filtroNombre
            ? d.voluntarios?.name.toLowerCase().includes(filtroNombre.toLowerCase())
            : true;
        return coincideDia && coincideNombre;
    });

    return (
        <div className="p-6 bg-white shadow-lg rounded-xl mt-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Disponibilidad de voluntarios</h2>

            <div className="flex gap-4 mb-6">
                <input
                    type="date"
                    value={filtroDia}
                    onChange={(e) => setFiltroDia(e.target.value)}
                    className="border px-3 py-2 rounded w-1/3"
                    placeholder="Filtrar por día"
                />
                <input
                    type="text"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="border px-3 py-2 rounded w-2/3"
                    placeholder="Buscar voluntario por nombre"
                />
            </div>

            <ul className="space-y-3 max-h-[400px] overflow-auto">
                {disponibilidadFiltrada.map((item) => (
                    <li key={item.id} className="bg-blue-100 px-4 py-2 rounded-lg shadow-sm text-gray-800">
                        <strong>{item.voluntarios?.name}</strong> – {item.dia} de {item.hora_inicio} a {item.hora_fin}
                    </li>
                ))}
            </ul>

            {disponibilidadFiltrada.length === 0 && (
                <p className="text-gray-500 mt-4">No hay disponibilidad registrada con esos filtros.</p>
            )}
        </div>
    );
}
