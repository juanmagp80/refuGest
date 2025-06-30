"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function RespuestasVoluntarios({ refugioId, voluntarioId }) {
    const [respuestas, setRespuestas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("📦 Props recibidas en RespuestasVoluntarios:", {
            refugioId,
            voluntarioId
        });

        const cargarRespuestas = async () => {
            if (!refugioId || !voluntarioId) {
                console.warn("❌ refugioId o voluntarioId no definido");
                return;
            }

            const { data, error } = await supabase
                .from("notificaciones")
                .select(`
                    id,
                    mensaje,
                    respuesta,
                    created_at,
                    voluntario:voluntario_id(name)
                `)
                .eq("refugio_id", refugioId)
                .eq("voluntario_id", voluntarioId)
                .eq("respondida", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("❌ Error cargando respuestas:", error);
            } else {
                console.log("✅ Respuestas cargadas:", data);
                setRespuestas(data);
            }

            setLoading(false);
        };

        cargarRespuestas();
    }, [refugioId, voluntarioId]);

    if (loading) return <p>Cargando respuestas...</p>;

    if (respuestas.length === 0) {
        return <p className="text-gray-500 mt-4">No hay respuestas aún.</p>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Respuestas de Voluntarios</h2>
            <ul className="space-y-4">
                {respuestas.map((r) => (
                    <li key={r.id} className="p-4 bg-gray-100 rounded-lg border shadow">
                        <p><strong>Voluntario:</strong> {r.voluntario?.name || "Sin nombre"}</p>
                        <p><strong>Mensaje enviado:</strong> {r.mensaje}</p>
                        <p className="mt-2 text-green-700"><strong>Respuesta:</strong> {r.respuesta}</p>
                        <p className="text-xs text-gray-500 mt-1">Fecha: {new Date(r.created_at).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
