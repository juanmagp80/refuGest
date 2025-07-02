"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaPaw } from "react-icons/fa";

export default function Animales({ refugioId }) {
    const [animales, setAnimales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!refugioId) return;

        setLoading(true);

        supabase
            .from("animales")
            .select("*")
            .eq("refugio_id", refugioId)
            .then(({ data, error }) => {
                if (error) {
                    console.error("Error cargando animales:", error.message);
                    setAnimales([]);
                } else {
                    setAnimales(data || []);
                }
                setLoading(false);
            });
    }, [refugioId]);

    if (loading) return <p className="text-center py-4">Cargando animales...</p>;
    if (!animales.length)
        return <p className="text-center py-4 text-gray-600">No hay animales registrados.</p>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
                <FaPaw aria-hidden="true" /> Animales del refugio
            </h2>
            <ul className="space-y-4">
                {animales.map(({ id, nombre, especie, edad, descripcion }) => (
                    <li
                        key={id}
                        className="bg-blue-50 rounded-lg p-4 shadow flex flex-col gap-1"
                        role="listitem"
                        tabIndex={0}
                    >
                        <span className="font-semibold text-blue-900 text-lg">
                            {nombre} <span className="text-gray-600 text-base">({especie})</span>
                        </span>
                        <span className="text-gray-800">Edad: {edad || "Desconocida"}</span>
                        <p className="text-gray-700">{descripcion || "Sin descripción"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
