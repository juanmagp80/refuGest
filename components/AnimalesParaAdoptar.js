"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function AnimalesParaAdoptar({ adoptanteId }) {
    const [animales, setAnimales] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [solicitando, setSolicitando] = useState(null);

    useEffect(() => {
        const fetchAnimales = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("animales")
                .select("*, refugio:refugio_id(name, provincia)")
                .eq("status", "Disponible")
                .order("created_at", { ascending: false });

            if (error) setError(error.message);
            else setAnimales(data);
            setLoading(false);
        };
        fetchAnimales();
    }, []);

    const solicitarAdopcion = async (animalId) => {
        setSolicitando(animalId);
        setError(null);

        const { data: existing, error: errCheck } = await supabase
            .from("solicitudes_adopcion")
            .select("*")
            .eq("animal_id", animalId)
            .eq("adoptante_id", adoptanteId)
            .eq("estado", "pendiente")
            .single();

        if (errCheck && errCheck.code !== "PGRST116") {
            setError(errCheck.message);
            setSolicitando(null);
            return;
        }

        if (existing) {
            setError("Ya tienes una solicitud pendiente para este animal.");
            setSolicitando(null);
            return;
        }

        const { error } = await supabase.from("solicitudes_adopcion").insert({
            adoptante_id: adoptanteId,
            animal_id: animalId,
            estado: "pendiente",
        });

        if (error) setError(error.message);
        else alert("🐾 Solicitud enviada correctamente.");

        setSolicitando(null);
    };

    if (loading) return <p className="text-center text-xl font-medium text-gray-700">Cargando animales disponibles...</p>;
    if (error) return <p className="text-center text-red-600 font-semibold">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-4xl font-extrabold text-center text-purple-700 mb-10 drop-shadow">🐶 Encuentra tu compañero ideal 🐱</h2>
            {animales.length === 0 ? (
                <p className="text-center text-gray-500">No hay animales disponibles en este momento.</p>
            ) : (
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {animales.map((animal) => (
                        <div key={animal.id} className="bg-white rounded-3xl shadow-xl overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
                            <Link href={`/animal/${animal.id}`} className="block hover:bg-gray-50">
                                <img
                                    src={animal.imagen || "/animal-placeholder.png"}
                                    alt={animal.name}
                                    className="w-full h-56 object-cover"
                                />
                                <p className="text-center text-lg font-semibold text-gray-800 bg-gradient-to-r from-purple-100 to-purple-200 p-3">
                                    {animal.refugio?.name} – {animal.refugio?.provincia}
                                    <span className="block text-sm text-gray-500">Edad: {animal.edad}</span>                                </p>
                                <div className="p-5">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{animal.name}</h3>
                                    <p className="text-sm text-gray-600 italic mb-1">{animal.species} • {animal.breed}</p>
                                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{animal.descripcion}</p>
                                </div>
                            </Link>

                            <div className="px-5 pb-5">
                                <button
                                    disabled={solicitando === animal.id}
                                    onClick={() => solicitarAdopcion(animal.id)}
                                    className={`w-full py-2 px-4 rounded-full font-semibold transition-all duration-300 ${solicitando === animal.id
                                        ? "bg-gray-400 text-white cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                        }`}
                                >
                                    {solicitando === animal.id ? "Enviando solicitud..." : "Solicitar adopción"}
                                </button>
                            </div>
                        </div>

                    ))}
                </div>
            )}
        </div>
    );
}
