// ChatConversacion.js
"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";

export default function ChatConversacion({ refugioId, voluntarioId }) {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [autor, setAutor] = useState("refugio"); // o "voluntario", según el contexto
    const [cerrado, setCerrado] = useState(false);
    const [remitente, setRemitente] = useState("refugio"); // o "voluntario"

    const scrollRef = useRef(null);

    useEffect(() => {
        if (!refugioId || !voluntarioId) return;
        cargarMensajes();
        const canal = supabase
            .channel("conversaciones-chat")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "chat" },
                (payload) => {
                    if (
                        payload.new.refugio_id === refugioId &&
                        payload.new.voluntario_id === voluntarioId
                    ) {
                        setMensajes((prev) => [...prev, payload.new]);
                    }
                }
            )
            .subscribe();
        return () => supabase.removeChannel(canal);
    }, [refugioId, voluntarioId]);

    const cargarMensajes = async () => {
        const { data, error } = await supabase
            .from("chat")
            .select("*")
            .eq("refugio_id", refugioId)
            .eq("voluntario_id", voluntarioId)
            .order("created_at", { ascending: true });

        if (!error && data) {
            setMensajes(data);
            if (data.at(-1)?.cerrado) setCerrado(true);
        }
    };

    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;
        await supabase.from("chat").insert({
            refugio_id: refugioId,
            voluntario_id: voluntarioId,
            mensaje: nuevoMensaje,
            remitente,

        });
        setNuevoMensaje("");
    };

    const cerrarConversacion = async () => {
        await supabase.from("chat").insert({
            refugio_id: refugioId,
            voluntario_id: voluntarioId,
            mensaje: "Conversación cerrada",
            autor: "sistema",
            cerrado: true,
        });
        setCerrado(true);
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    return (
        <div className="border p-4 rounded-lg max-w-xl mx-auto bg-white shadow">
            <h2 className="text-lg font-bold mb-4">Conversación</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {mensajes.map((m) => (
                    <div
                        key={m.id}
                        className={`p-2 rounded-lg max-w-[75%] ${m.remitente === remitente ? "bg-blue-100 ml-auto" : "bg-gray-100"}`

                        }
                    >
                        <div className="text-sm">{m.mensaje}</div>
                        <div className="text-xs text-gray-400">{m.autor}</div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>
            {!cerrado ? (
                <div className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        className="flex-1 border rounded px-2 py-1"
                        placeholder="Escribe un mensaje"
                    />
                    <button
                        onClick={enviarMensaje}
                        className="bg-blue-500 text-white px-4 py-1 rounded"
                    >
                        Enviar
                    </button>
                </div>
            ) : (
                <p className="text-center mt-4 text-gray-500">
                    Conversación cerrada
                </p>
            )}
            {!cerrado && (
                <button
                    onClick={cerrarConversacion}
                    className="mt-2 text-sm text-red-500 underline"
                >
                    Cerrar conversación
                </button>
            )}
        </div>
    );
}
