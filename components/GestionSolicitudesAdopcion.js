"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function GestionSolicitudesAdopcion({ refugioId }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSolicitudes = async () => {
        setLoading(true);
        setError(null);

        try {
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

            const { data, error } = await supabase
                .from("solicitudes_adopcion")
                .select(`
          id,
          status,
          adoptante_id,
          animal_id,
          adoptante:adoptante_id(name, contact_info),
          animal:animal_id(id, name, status)
        `)
                .in("animal_id", animalIds)
                .or("status.eq.pendiente,status.eq.aceptada");

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

    const aceptarSolicitud = async (solicitud) => {
        setError(null);

        try {
            const { error: errorInsert } = await supabase.from("adopciones").insert([
                {
                    adoptante_id: solicitud.adoptante_id,
                    animal_id: solicitud.animal_id,
                },
            ]);
            if (errorInsert) throw errorInsert;

            const { error: errorAnimal } = await supabase
                .from("animales")
                .update({ status: "Adoptado" })
                .eq("id", solicitud.animal_id);
            if (errorAnimal) throw errorAnimal;

            const { error: errorSolicitud } = await supabase
                .from("solicitudes_adopcion")
                .update({ status: "aceptada" })
                .eq("id", solicitud.id);
            if (errorSolicitud) throw errorSolicitud;

            const { error: errorOtras } = await supabase
                .from("solicitudes_adopcion")
                .update({ status: "rechazada" })
                .eq("animal_id", solicitud.animal_id)
                .neq("id", solicitud.id);
            if (errorOtras) throw errorOtras;

            alert(`Has aceptado la adopción de ${solicitud.animal.name} para ${solicitud.adoptante.name}`);
            fetchSolicitudes();
        } catch (err) {
            setError(err.message);
        }
    };

    const rechazarSolicitud = async (id) => {
        setError(null);

        const { error } = await supabase
            .from("solicitudes_adopcion")
            .update({ status: "rechazada" })
            .eq("id", id);

        if (error) {
            setError(error.message);
        } else {
            fetchSolicitudes();
        }
    };

    if (loading) return <p className="text-center py-6 text-gray-700">Cargando solicitudes...</p>;

    if (error)
        return (
            <p className="text-center text-red-600 font-semibold py-6 select-text">
                {error}
            </p>
        );

    if (solicitudes.length === 0)
        return (
            <p className="text-center py-6 text-gray-500 select-none">
                No hay solicitudes de adopción para gestionar.
            </p>
        );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 select-none">
                Solicitudes de adopción
            </h2>

            <ul className="space-y-6">
                {solicitudes.map((sol) => (
                    <li
                        key={sol.id}
                        className="border border-gray-300 rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                    >
                        <div className="flex flex-col space-y-2 text-gray-800">
                            <p className="text-lg font-semibold flex flex-wrap items-center gap-2">
                                <span>Animal: {sol.animal.name}</span>
                                <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${sol.animal.status === "Adoptado"
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
                                    className={`font-semibold ${sol.status === "pendiente"
                                        ? "text-yellow-600"
                                        : sol.status === "aceptada"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                >
                                    {sol.status.charAt(0).toUpperCase() + sol.status.slice(1)}
                                </span>
                            </p>
                        </div>

                        {sol.status === "pendiente" && (
                            <div className="flex flex-wrap gap-3 justify-start sm:justify-end">
                                <button
                                    onClick={() => aceptarSolicitud(sol)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-semibold transition-transform active:scale-95"
                                >
                                    Aceptar
                                </button>
                                <button
                                    onClick={() => rechazarSolicitud(sol.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-semibold transition-transform active:scale-95"
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
