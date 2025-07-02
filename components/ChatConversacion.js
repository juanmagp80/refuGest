"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";

export default function ChatConversacion({ refugioId, voluntarioId, remitente }) {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [cerrado, setCerrado] = useState(false);
    const [mensajeEnviado, setMensajeEnviado] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (!refugioId || !voluntarioId) return;
        cargarMensajes();

        const canal = supabase
            .channel("conversaciones-chat")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "chat",
            }, (payload) => {
                if (
                    payload.new.refugio_id === refugioId &&
                    payload.new.voluntario_id === voluntarioId
                ) {
                    setMensajes((prev) => [...prev, payload.new]);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(canal);
    }, [refugioId, voluntarioId]);

    const cargarMensajes = async () => {
        const { data, error } = await supabase
            .from("chat")
            .select(`
                id, mensaje, created_at, remitente, cerrado,
                leido_refugio, leido_voluntario,
                refugio:refugio_id(name),
                voluntario:voluntario_id(name)
            `)
            .eq("refugio_id", refugioId)
            .eq("voluntario_id", voluntarioId)
            .order("created_at", { ascending: true });

        if (!error) setMensajes(data);
        else console.error("Error al cargar mensajes:", error);
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
        setMensajeEnviado(true);
        setTimeout(() => setMensajeEnviado(false), 3000);
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

    const eliminarMensaje = async (id) => {
        const { error } = await supabase.from("chat").delete().eq("id", id);
        if (!error) setMensajes((prev) => prev.filter((m) => m.id !== id));
        else alert("Error al eliminar el mensaje");
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    return (
        <div className="border border-gray-300 p-4 md:p-8 rounded-2xl max-w-3xl mx-auto bg-white shadow-md">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">Conversación</h2>

            <div className="space-y-4 overflow-y-auto max-h-[400px] md:max-h-[500px] px-2">
                {mensajes.map((m) => (
                    <div
                        key={m.id}
                        className={`p-3 md:p-4 rounded-xl max-w-[85%] text-sm md:text-base transition ${m.remitente === remitente
                                ? "bg-blue-500 text-white ml-auto"
                                : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        <div className="flex justify-between items-center text-xs md:text-sm mb-1">
                            <span className="font-semibold">
                                {m.remitente === "refugio"
                                    ? m.refugio?.name || "Refugio"
                                    : m.voluntario?.name || "Voluntario"}
                            </span>
                            <span className="text-gray-100 md:text-gray-300">
                                {new Date(m.created_at).toLocaleString()}
                            </span>
                        </div>

                        <div className="text-base md:text-lg">{m.mensaje}</div>

                        {m.remitente.toLowerCase() === remitente.toLowerCase() && (
                            <div className="mt-1 text-xs">
                                <button
                                    onClick={() => eliminarMensaje(m.id)}
                                    className="text-red-500 hover:underline"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {!cerrado ? (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <input
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm md:text-base focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <button
                        onClick={enviarMensaje}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full text-sm md:text-base font-semibold transition"
                    >
                        Enviar
                    </button>
                </div>
            ) : (
                <p className="text-center mt-6 text-gray-500 font-semibold text-lg">Conversación cerrada</p>
            )}

            {mensajeEnviado && (
                <div className="mt-4 p-3 bg-green-500 text-white rounded-full text-center text-sm font-semibold shadow-md">
                    ¡Mensaje enviado!
                </div>
            )}
        </div>
    );
}
