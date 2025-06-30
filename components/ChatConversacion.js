"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";

export default function ChatConversacion({ refugioId, voluntarioId }) {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [cerrado, setCerrado] = useState(false);
    const [remitente, setRemitente] = useState("refugio"); // o "voluntario"
    const [mensajeEnviado, setMensajeEnviado] = useState(false); // Estado para la notificación

    const scrollRef = useRef(null);

    useEffect(() => {
        if (!refugioId || !voluntarioId) return;
        cargarMensajes();

        // Conexión al canal de WebSocket y suscripción a los cambios
        const canal = supabase
            .channel("conversaciones-chat")
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "chat"
            }, (payload) => {
                // Solo actualizar si el refugio y el voluntario coinciden
                if (
                    payload.new.refugio_id === refugioId &&
                    payload.new.voluntario_id === voluntarioId
                ) {
                    setMensajes((prev) => [...prev, payload.new]);
                }
            })
            .subscribe();

        // Monitorear si hay errores con el canal
        canal.on("error", (err) => {
            console.error("Error al suscribirse al canal:", err);
        });

        // Cleanup: desconectar el canal cuando el componente se desmonte
        return () => {
            supabase.removeChannel(canal);
        };
    }, [refugioId, voluntarioId]);

    // Función para cargar los mensajes del chat
    const cargarMensajes = async () => {
        const { data, error } = await supabase
            .from("chat")
            .select(`
                id,
                mensaje,
                created_at,
                remitente,
                refugio_id,
                voluntario_id,
                leido_refugio,
                leido_voluntario,
                refugios(name),
                voluntarios(name)
            `)
            .eq("refugio_id", refugioId)
            .eq("voluntario_id", voluntarioId)
            .order("created_at", { ascending: true })
            .limit(0); // Esto elimina el límite de filas

        if (error) {
            console.error("Error al cargar los mensajes:", error);
        } else {
            setMensajes(data);
        }
    };

    // Función para enviar un mensaje
    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;

        const { error } = await supabase.from("chat").insert({
            refugio_id: refugioId,
            voluntario_id: voluntarioId,
            mensaje: nuevoMensaje,
            remitente,
            leido_refugio: false, // Inicializado en false
            leido_voluntario: false, // Inicializado en false
        });

        if (error) {
            console.error("Error al enviar el mensaje:", error);
            return;
        }

        setNuevoMensaje("");

        // Mostrar mensaje de "Mensaje enviado"
        setMensajeEnviado(true);
        setTimeout(() => setMensajeEnviado(false), 3000); // Ocultar el mensaje después de 3 segundos
    };

    // Función para cerrar la conversación
    const cerrarConversacion = async () => {
        const { error } = await supabase.from("chat").insert({
            refugio_id: refugioId,
            voluntario_id: voluntarioId,
            mensaje: "Conversación cerrada",
            autor: "sistema",
            cerrado: true,
        });

        if (error) {
            console.error("Error al cerrar la conversación:", error);
            return;
        }

        setCerrado(true);
    };

    // Función para actualizar el estado de "leído" del refugio
    const actualizarLeidoRefugio = async (mensajeId) => {
        const { data, error } = await supabase
            .from("chat")
            .update({ leido_refugio: true })
            .eq("id", mensajeId)
            .eq("refugio_id", refugioId);

        if (error) {
            console.error("Error al actualizar el estado de leido_refugio:", error);
        } else {
            console.log("Estado de leido_refugio actualizado", data);
        }
    };

    // Función para actualizar el estado de "leído" del voluntario
    const actualizarLeidoVoluntario = async (mensajeId) => {
        const { data, error } = await supabase
            .from("chat")
            .update({ leido_voluntario: true })
            .eq("id", mensajeId)
            .eq("voluntario_id", voluntarioId);

        if (error) {
            console.error("Error al actualizar el estado de leido_voluntario:", error);
        } else {
            console.log("Estado de leido_voluntario actualizado", data);
        }
    };

    // Desplazar hacia el último mensaje cuando se agregue un nuevo mensaje
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    return (
        <div className="border-2 border-gray-300 p-8 rounded-3xl max-w-3xl mx-auto bg-white shadow-lg">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">Conversación</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto scroll-smooth px-4">
                {mensajes.map((m) => (
                    <div
                        key={m.id}
                        className={`p-4 rounded-lg max-w-[75%] transition-all ${m.remitente === remitente
                            ? "bg-blue-500 text-white ml-auto"
                            : "bg-gray-200 text-gray-900"
                            }`}
                    >
                        <div className="flex justify-between">
                            <div className="font-semibold text-sm text-white">
                                {m.remitente === "refugio" ? m.refugio.name : m.voluntario.name}
                            </div>
                            <div className="text-xs text-gray-200">
                                {new Date(m.created_at).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-lg mt-1">{m.mensaje}</div>
                        <div className="text-xs mt-2">
                            <span className={`font-semibold ${m.leido_refugio || m.leido_voluntario ? 'text-green-400' : 'text-red-500'}`}>
                                {m.leido_refugio || m.leido_voluntario ? 'Leído' : 'No leído'}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {!cerrado ? (
                <div className="mt-6 flex gap-4">
                    <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        className="flex-1 border-2 border-gray-300 rounded-full px-6 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Escribe un mensaje..."
                    />
                    <button
                        onClick={enviarMensaje}
                        className="bg-blue-500 text-white px-8 py-3 rounded-full shadow-md hover:bg-blue-600 transition-all"
                    >
                        Enviar
                    </button>
                </div>
            ) : (
                <p className="text-center mt-8 text-gray-500 font-semibold text-xl">
                    Conversación cerrada
                </p>
            )}

            {!cerrado && (
                <button
                    onClick={cerrarConversacion}
                    className="mt-4 text-sm text-red-600 underline font-bold hover:text-red-700 transition-all duration-300"
                >
                    Cerrar conversación
                </button>
            )}

            {/* Notificación de mensaje enviado */}
            {mensajeEnviado && (
                <div className="mt-4 p-4 bg-green-500 text-white rounded-full shadow-lg">
                    <p className="text-center text-xl font-semibold">¡Mensaje enviado!</p>
                </div>
            )}
        </div>
    );
}
