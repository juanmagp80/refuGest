"use client";

import ChatConversacion from "@/components/ChatConversacion";
import MiDisponibilidad from "@/components/MiDisponibilidad";
import MisTareas from "@/components/MisTareas";
import NotificacionIcon from "@/components/NotificacionIcon";
import PanelNotificaciones from "@/components/PanelNotificaciones";
import VoluntarioAnimales from "@/components/VoluntarioAnimales";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function DashboardVoluntario({ voluntario }) {
    const [vista, setVista] = useState("tareas");
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const [chatRefugioId, setChatRefugioId] = useState(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-100 p-10 relative">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-green-700">¡Hola, {voluntario.name}!</h1>
                    <NotificacionIcon voluntarioId={voluntario.id} onClick={() => setMostrarPanel(!mostrarPanel)} />
                </div>

                {mostrarPanel && (
                    <PanelNotificaciones
                        voluntarioId={voluntario.id}
                        onSeleccionarConversacion={(refugioId) => {
                            setChatRefugioId(refugioId);
                            setMostrarPanel(false);
                        }}
                    />
                )}

                {!chatRefugioId ? (
                    <>
                        <div className="flex gap-4 justify-center mb-6 mt-6">
                            <button
                                onClick={() => setVista("tareas")}
                                className={`px-4 py-2 rounded-full font-bold transition ${vista === "tareas" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                Mis tareas
                            </button>
                            <button
                                onClick={() => setVista("animales")}
                                className={`px-4 py-2 rounded-full font-bold transition ${vista === "animales" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                Animales
                            </button>
                            <button
                                onClick={() => setVista("chat")}
                                className={`px-4 py-2 rounded-full font-bold transition ${vista === "chat" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setVista("disponibilidad")}
                                className={`px-4 py-2 rounded-full font-bold transition ${vista === "disponibilidad" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"}`}
                            >
                                Disponibilidad
                            </button>
                        </div>

                        {vista === "tareas" && <MisTareas />}
                        {vista === "disponibilidad" && <MiDisponibilidad voluntarioId={voluntario.id} />}
                        {vista === "animales" && <VoluntarioAnimales />}
                        {vista === "chat" && <ChatConversacion refugioId={voluntario.refugio_id} voluntarioId={voluntario.id} remitente="voluntario" />}
                    </>
                ) : (
                    <>
                        <button onClick={() => setChatRefugioId(null)} className="mb-4 text-blue-600 underline">
                            ← Volver a notificaciones
                        </button>
                        <button
                            onClick={() => setVista("disponibilidad")}
                            className={`px-4 py-2 rounded-full font-bold transition ${vista === "disponibilidad" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        >
                            Disponibilidad
                        </button>
                        <ChatConversacion refugioId={chatRefugioId} voluntarioId={voluntario.id} remitente="voluntario" />
                    </>
                )}

                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}
