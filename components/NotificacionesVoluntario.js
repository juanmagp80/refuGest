"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function NotificacionesVoluntario({ voluntarioId }) {
    const [notificaciones, setNotificaciones] = useState([]);

    useEffect(() => {
        const fetchNotificaciones = async () => {
            const { data, error } = await supabase
                .from("notificaciones")
                .select("*")
                .eq("voluntario_id", voluntarioId)
                .eq("leida", false)
                .order("created_at", { ascending: false });

            if (!error) setNotificaciones(data);
        };

        fetchNotificaciones();
    }, [voluntarioId]);

    if (notificaciones.length === 0) {
        return <p className="text-gray-600">No tienes nuevas notificaciones.</p>;
    }

    return (
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-6">
            <h3 className="font-bold mb-2">Notificaciones</h3>
            <ul className="list-disc list-inside">
                {notificaciones.map((n) => (
                    <li key={n.id} className="mb-1">
                        {n.mensaje}
                    </li>
                ))}
            </ul>
        </div>
    );
}
