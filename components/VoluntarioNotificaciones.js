"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import ChatConversacion from "./ChatConversacion";

export default function VoluntarioNotificaciones({ voluntarioId }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [refugioSeleccionado, setRefugioSeleccionado] = useState(null);

    useEffect(() => {
        if (!voluntarioId) return;

        // Carga las últimas conversaciones del voluntario
        cargarNotificaciones();
    }, [voluntarioId]);

    const cargarNotificaciones = async () => {
        // Aquí se asume que las conversaciones se agrupan por refugio y voluntario
        // Por ejemplo, traemos el último mensaje por cada refugio para ese voluntario
        const { data, error } = await supabase
            .from("chat")
            .select("refugio_id, mensaje, created_at")
            .eq("voluntario_id", voluntarioId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error cargando notificaciones:", error);
            return;
        }

        // Filtrar para obtener solo la última por refugio
        const ultimosPorRefugio = data.reduce((acc, msg) => {
            if (!acc[msg.refugio_id]) acc[msg.refugio_id] = msg;
            return acc;
        }, {});

        setNotificaciones(Object.values(ultimosPorRefugio));
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Notificaciones</h1>
            {refugioSeleccionado ? (
                <>
                    <button
                        onClick={() => setRefugioSeleccionado(null)}
                        className="mb-2 text-blue-600 underline"
                    >
                        ← Volver a notificaciones
                    </button>
                    <ChatConversacion
                        refugioId={refugioSeleccionado}
                        voluntarioId={voluntarioId}
                    />
                </>
            ) : (
                <ul className="space-y-2">
                    {notificaciones.map(({ refugio_id, mensaje, created_at }) => (
                        <li
                            key={refugio_id}
                            onClick={() => setRefugioSeleccionado(refugio_id)}
                            className="cursor-pointer p-2 border rounded hover:bg-gray-100"
                        >
                            <div>
                                <strong>Refugio ID:</strong> {refugio_id}
                            </div>
                            <div>
                                <strong>Último mensaje:</strong> {mensaje}
                            </div>
                            <div className="text-sm text-gray-500">
                                {new Date(created_at).toLocaleString()}
                            </div>
                        </li>
                    ))}
                    {notificaciones.length === 0 && (
                        <p>No tienes notificaciones.</p>
                    )}
                </ul>
            )}
        </div>
    );
}
