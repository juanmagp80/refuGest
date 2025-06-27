"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function EnviarNotificacion({ voluntarioId, refugioId }) {
    const [mensaje, setMensaje] = useState("");
    const [estado, setEstado] = useState(null);

    const enviar = async () => {
        if (!mensaje || !voluntarioId || !refugioId) {
            setEstado({ tipo: "error", texto: "Faltan datos para enviar la notificación." });
            return;
        }

        const { error } = await supabase.from("notificaciones").insert({
            mensaje,
            voluntario_id: voluntarioId,
            refugio_id: refugioId,
            leida: false,
        });

        if (error) {
            console.error("Error al enviar notificación:", error);
            setEstado({ tipo: "error", texto: "Error al enviar la notificación." });
        } else {
            setEstado({ tipo: "ok", texto: "Notificación enviada correctamente." });
            setMensaje("");
        }
    };

    return (
        <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Enviar notificación</h3>
            <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe un mensaje para el voluntario..."
                className="w-full p-2 border rounded mb-2"
            />
            <button
                onClick={enviar}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-bold transition"
            >
                Enviar
            </button>

            {estado && (
                <p className={`mt-2 font-semibold ${estado.tipo === "ok" ? "text-green-600" : "text-red-600"}`}>
                    {estado.texto}
                </p>
            )}
        </div>
    );
}
