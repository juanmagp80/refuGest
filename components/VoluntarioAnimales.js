"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import FormularioAnimal from "./FormularioAnimal";

export default function VoluntarioAnimales() {
    const [animales, setAnimales] = useState([]);
    const [refugioId, setRefugioId] = useState(null);
    const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

    useEffect(() => {
        const fetchVoluntario = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: voluntario } = await supabase
                .from("voluntarios")
                .select("refugio_id")
                .eq("user_id", user.id)
                .single();

            if (voluntario?.refugio_id) {
                setRefugioId(voluntario.refugio_id);
            }
        };

        fetchVoluntario();
    }, []);

    useEffect(() => {
        const fetchAnimales = async () => {
            if (!refugioId) return;
            const { data } = await supabase
                .from("animales")
                .select("*")
                .eq("refugio_id", refugioId);
            setAnimales(data || []);
        };

        fetchAnimales();
    }, [refugioId]);

    const camposEditables = [
        "descripcion",
        "vacunas",
        "enfermedades",
        "tratamientos",
        "observaciones",
        "ultima_visita",
        "veterinario",
        "imagen"
    ];

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">🐶 Animales del refugio</h2>

            {!animalSeleccionado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {animales.map(animal => (
                        <div key={animal.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-md">
                            <h3 className="text-lg font-bold text-gray-800">{animal.name}</h3>
                            <p className="text-gray-600">Raza: {animal.breed}</p>
                            <p className="text-gray-600">Edad: {animal.edad}</p>
                            {animal.imagen && (
                                <img src={animal.imagen} alt={animal.name} className="w-full h-40 object-cover rounded-lg mt-2" />
                            )}
                            <button
                                onClick={() => setAnimalSeleccionado(animal)}
                                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Editar
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-6">
                    <button
                        onClick={() => setAnimalSeleccionado(null)}
                        className="mb-4 text-blue-600 hover:underline"
                    >
                        ← Volver a la lista
                    </button>
                    <FormularioAnimal
                        animal={animalSeleccionado}
                        camposEditables={camposEditables}
                        onSuccess={() => {
                            setAnimalSeleccionado(null);
                            // Vuelve a cargar los animales
                            supabase
                                .from("animales")
                                .select("*")
                                .eq("refugio_id", refugioId)
                                .then(({ data }) => setAnimales(data || []));
                        }}
                    />
                </div>
            )}
        </div>
    );
}
