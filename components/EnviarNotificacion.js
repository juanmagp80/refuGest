"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function EnviarNotificacion({ voluntarioId, refugioId }) {
    const [mensaje, setMensaje] = useState("");
    const [estado, setEstado] = useState(null);

    const enviar = async () => {
        if (!mensaje.trim() || !voluntarioId || !refugioId) {
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
        <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow max-w-md mx-auto">
            <h3 className="text-lg font-bold text-yellow-800 mb-3 text-center select-none">
                Enviar notificación
            </h3>
            <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe un mensaje para el voluntario..."
                rows={4}
                className="w-full p-3 text-sm sm:text-base border border-yellow-300 rounded resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transition"
            />
            <button
                onClick={enviar}
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded transition transform hover:scale-[1.02] active:scale-95"
            >
                Enviar
            </button>

            {estado && (
                <p
                    className={`mt-3 text-center font-semibold ${estado.tipo === "ok" ? "text-green-600" : "text-red-600"
                        }`}
                    role="alert"
                >
                    {estado.texto}
                </p>
            )}
        </div>
    );
}
