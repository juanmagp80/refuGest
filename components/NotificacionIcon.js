import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";

export default function NotificacionIcon({ voluntarioId, onClick }) {
    const [tieneNotificaciones, setTieneNotificaciones] = useState(false);

    useEffect(() => {
        if (!voluntarioId) return;

        async function checkNotificaciones() {
            const { data, error } = await supabase
                .from("notificaciones")
                .select("id")
                .eq("voluntario_id", voluntarioId)
                .eq("leida", false)
                .limit(1);

            setTieneNotificaciones(!error && data.length > 0);
        }

        checkNotificaciones();

        // Suscripción en tiempo real usando canal y eventos
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
                    setTieneNotificaciones(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [voluntarioId]);

    return (
        <button
            onClick={onClick}
            className={`relative text-2xl ${tieneNotificaciones ? "animate-pulse text-red-600" : "text-gray-600"}`}
            aria-label="Notificaciones"
        >
            <FaEnvelope />
            {tieneNotificaciones && (
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-600 animate-ping"></span>
            )}
        </button>
    );
}
