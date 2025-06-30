"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function PanelNotificaciones({ voluntarioId, onSeleccionarConversacion }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!voluntarioId) return;

        const cargarNotificaciones = async () => {
            const { data, error } = await supabase
                .from("notificaciones")
                .select("*")
                .eq("voluntario_id", voluntarioId)
                .order("created_at", { ascending: false });

            if (!error) setNotificaciones(data);
            else setNotificaciones([]);
        };

        cargarNotificaciones();

        const channel = supabase
            .channel(`notificaciones-voluntario-${voluntarioId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notificaciones",
                    filter: `voluntario_id=eq.${voluntarioId}`
                },
                () => {
                    cargarNotificaciones();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notificaciones",
                    filter: `voluntario_id=eq.${voluntarioId}`
                },
                () => {
                    cargarNotificaciones();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [voluntarioId]);

    const marcarLeida = async (id) => {
        await supabase
            .from("notificaciones")
            .update({ leida: true })
            .eq("id", id);

        setNotificaciones((current) =>
            current.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
    };

    const enviarRespuesta = async (id) => {
        if (!respuestas[id] || respuestas[id].trim() === "") {
            alert("Escribe una respuesta antes de enviar.");
            return;
        }
        setLoading(true);
        const { error } = await supabase
            .from("notificaciones")
            .update({ respuesta: respuestas[id], respondida: true })
            .eq("id", id);

        if (error) {
            alert("Error enviando respuesta");
        } else {
            alert("Respuesta enviada");
            setRespuestas({ ...respuestas, [id]: "" });
            setNotificaciones((current) =>
                current.map((n) =>
                    n.id === id ? { ...n, respondida: true, respuesta: respuestas[id] } : n
                )
            );
        }
        setLoading(false);
    };

    return (
        <div className="fixed top-20 right-4 w-80 max-h-[400px] overflow-auto bg-white border rounded shadow-lg p-4 z-50">
            <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
            {notificaciones.length === 0 && <p>No tienes notificaciones.</p>}
            {notificaciones.map((n) => (
                <div key={n.id} className="mb-4 border-b pb-2">
                    <p><strong>Mensaje:</strong> {n.mensaje}</p>
                    <p className="text-xs text-gray-500 mb-2">
                        Recibido: {new Date(n.created_at).toLocaleString()}
                    </p>

                    {/* Botón para abrir chat con el refugio */}
                    <button
                        onClick={() => onSeleccionarConversacion(n.refugio_id)}
                        className="text-sm text-green-600 underline mb-2"
                    >
                        Abrir chat con refugio
                    </button>

                    {!n.leida && (
                        <button
                            onClick={() => marcarLeida(n.id)}
                            className="text-xs text-blue-600 underline mb-2"
                        >
                            Marcar como leída
                        </button>
                    )}

                    {n.respondida ? (
                        <p className="bg-green-100 p-2 rounded text-sm">
                            Tu respuesta: {n.respuesta}
                        </p>
                    ) : (
                        <>
                            <textarea
                                rows={2}
                                placeholder="Escribe tu respuesta..."
                                value={respuestas[n.id] || ""}
                                onChange={(e) =>
                                    setRespuestas({ ...respuestas, [n.id]: e.target.value })
                                }
                                className="w-full border rounded p-1 mb-2"
                            />
                            <button
                                onClick={() => enviarRespuesta(n.id)}
                                disabled={loading}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                Responder
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
