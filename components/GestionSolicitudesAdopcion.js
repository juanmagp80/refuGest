"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function GestionSolicitudesAdopcion({ refugioId }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar solicitudes pendientes y aceptadas para el refugio
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Obtener los IDs de animales del refugio
            const { data: animalesData, error: animalesError } = await supabase
                .from("animales")
                .select("id")
                .eq("refugio_id", refugioId);

            if (animalesError) throw animalesError;

            const animalIds = animalesData?.map((a) => a.id) || [];

            if (animalIds.length === 0) {
                setSolicitudes([]);
                setLoading(false);
                return;
            }

            // 2. Obtener solicitudes de adopción para esos animales, con estado pendiente o aceptada
            const { data, error } = await supabase
                .from("solicitudes_adopcion")
                .select(`
  id,
  estado,
  adoptante_id,
  animal_id,
  adoptante:adoptante_id(name, contact_info),
  animal:animal_id(id, name, status)
`)
                .in("animal_id", animalIds)
                .or("estado.eq.pendiente,estado.eq.aceptada");

            if (error) throw error;

            setSolicitudes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (refugioId) fetchSolicitudes();
    }, [refugioId]);

    // Aceptar solicitud
    const aceptarSolicitud = async (solicitud) => {
        setError(null);

        try {
            // 1. Insertar en adopciones
            const { error: errorInsert } = await supabase.from("adopciones").insert([
                {
                    adoptante_id: solicitud.adoptante_id,
                    animal_id: solicitud.animal_id,
                },
            ]);
            if (errorInsert) throw errorInsert;

            // 2. Actualizar estado del animal a "Adoptado"
            const { error: errorAnimal } = await supabase
                .from("animales")
                .update({ status: "Adoptado" })
                .eq("id", solicitud.animal_id);
            if (errorAnimal) throw errorAnimal;

            // 3. Actualizar estado de la solicitud actual a "aceptada"
            const { error: errorSolicitud } = await supabase
                .from("solicitudes_adopcion")
                .update({ estado: "aceptada" })
                .eq("id", solicitud.id);
            if (errorSolicitud) throw errorSolicitud;

            // 4. Rechazar otras solicitudes para el mismo animal
            const { error: errorOtras } = await supabase
                .from("solicitudes_adopcion")
                .update({ estado: "rechazada" })
                .eq("animal_id", solicitud.animal_id)
                .neq("id", solicitud.id);
            if (errorOtras) throw errorOtras;

            alert(`Has aceptado la adopción de ${solicitud.animal.name} para ${solicitud.adoptante.name}`);
            fetchSolicitudes();
        } catch (err) {
            setError(err.message);
        }
    };

    // Rechazar solicitud
    const rechazarSolicitud = async (id) => {
        setError(null);

        const { error } = await supabase
            .from("solicitudes_adopcion")
            .update({ estado: "rechazada" })
            .eq("id", id);

        if (error) {
            setError(error.message);
        } else {
            fetchSolicitudes();
        }
    };

    if (loading) return <p>Cargando solicitudes...</p>;

    if (error) return <p className="text-red-600 font-bold">{error}</p>;

    if (solicitudes.length === 0)
        return <p>No hay solicitudes de adopción para gestionar.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Solicitudes de adopción</h2>

            <ul className="space-y-4">
                {solicitudes.map((sol) => (
                    <li
                        key={sol.id}
                        className="border p-4 rounded-lg flex flex-col md:flex-row md:justify-between md:items-center"
                    >
                        <div>
                            <p>
                                <strong>Animal:</strong> {sol.animal.name}{" "}
                                <span
                                    className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${sol.animal.status === "Adoptado"
                                        ? "bg-gray-300 text-gray-700"
                                        : "bg-green-200 text-green-800"
                                        }`}
                                >
                                    {sol.animal.status}
                                </span>
                            </p>
                            <p>
                                <strong>Solicitante:</strong> {sol.adoptante.name} -{" "}
                                {sol.adoptante.contact_info || "Sin contacto"}
                            </p>
                            <p>
                                <strong>Estado solicitud:</strong>{" "}
                                <span
                                    className={`font-semibold ${sol.estado === "pendiente"
                                        ? "text-yellow-600"
                                        : sol.estado === "aceptada"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {sol.estado.charAt(0).toUpperCase() + sol.estado.slice(1)}
                                </span>
                            </p>
                        </div>

                        {sol.estado === "pendiente" && (
                            <div className="mt-4 md:mt-0 flex gap-2">
                                <button
                                    onClick={() => aceptarSolicitud(sol)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-semibold"
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => rechazarSolicitud(sol.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-semibold"
                                >
                                    Rechazar
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
