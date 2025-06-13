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
            .then(({ data }) => {
                setAnimales(data || []);
                setLoading(false);
            });
    }, [refugioId]);

    if (loading) return <p>Cargando animales...</p>;
    if (!animales.length) return <p>No hay animales registrados.</p>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaPaw /> Animales del refugio</h2>
            <ul className="space-y-3">
                {animales.map((animal) => (
                    <li key={animal.id} className="bg-blue-50 rounded p-3 shadow flex flex-col">
                        <span className="font-semibold">{animal.nombre} ({animal.especie})</span>
                        <span>Edad: {animal.edad}</span>
                        <span className="text-gray-700">{animal.descripcion}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}