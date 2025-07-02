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

    const renderVistaPrincipal = () => (
        <>
            <nav className="flex gap-4 justify-center mb-6 mt-6 flex-wrap">
                <VistaBoton
                    label="Mis tareas"
                    activo={vista === "tareas"}
                    onClick={() => setVista("tareas")}
                    colorActivo="bg-green-500 text-white"
                    colorInactivo="bg-gray-200 text-gray-700"
                />
                <VistaBoton
                    label="Animales"
                    activo={vista === "animales"}
                    onClick={() => setVista("animales")}
                    colorActivo="bg-purple-500 text-white"
                    colorInactivo="bg-gray-200 text-gray-700"
                />
                <VistaBoton
                    label="Chat"
                    activo={vista === "chat"}
                    onClick={() => setVista("chat")}
                    colorActivo="bg-blue-500 text-white"
                    colorInactivo="bg-gray-200 text-gray-700"
                />
                <VistaBoton
                    label="Disponibilidad"
                    activo={vista === "disponibilidad"}
                    onClick={() => setVista("disponibilidad")}
                    colorActivo="bg-yellow-500 text-white"
                    colorInactivo="bg-gray-200 text-gray-700"
                />
            </nav>

            <section>
                {vista === "tareas" && <MisTareas />}
                {vista === "animales" && <VoluntarioAnimales />}
                {vista === "chat" && (
                    <ChatConversacion
                        refugioId={voluntario.refugio_id}
                        voluntarioId={voluntario.id}
                        remitente="voluntario"
                    />
                )}
                {vista === "disponibilidad" && <MiDisponibilidad voluntarioId={voluntario.id} />}
            </section>
        </>
    );

    const renderChatRefugio = () => (
        <>
            <button
                onClick={() => setChatRefugioId(null)}
                className="mb-4 text-blue-600 underline hover:text-blue-800 transition"
                type="button"
            >
                ← Volver a notificaciones
            </button>

            <div className="mb-6">
                <VistaBoton
                    label="Disponibilidad"
                    activo={vista === "disponibilidad"}
                    onClick={() => setVista("disponibilidad")}
                    colorActivo="bg-yellow-500 text-white"
                    colorInactivo="bg-gray-200 text-gray-700"
                />
            </div>

            <ChatConversacion
                refugioId={chatRefugioId}
                voluntarioId={voluntario.id}
                remitente="voluntario"
            />
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-100 p-6 sm:p-10 relative">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 sm:p-10 max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold text-green-700">¡Hola, {voluntario.name}!</h1>
                    <NotificacionIcon
                        voluntarioId={voluntario.id}
                        onClick={() => setMostrarPanel((v) => !v)}
                    />
                </header>

                {mostrarPanel && (
                    <PanelNotificaciones
                        voluntarioId={voluntario.id}
                        onSeleccionarConversacion={(refugioId) => {
                            setChatRefugioId(refugioId);
                            setMostrarPanel(false);
                        }}
                    />
                )}

                {!chatRefugioId ? renderVistaPrincipal() : renderChatRefugio()}

                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-transform duration-200 transform hover:scale-105"
                    type="button"
                    aria-label="Cerrar sesión"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}

function VistaBoton({ label, activo, onClick, colorActivo, colorInactivo }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full font-bold transition select-none focus:outline-none focus:ring-4 focus:ring-opacity-50 ${activo ? colorActivo : colorInactivo
                }`}
            type="button"
            aria-pressed={activo}
        >
            {label}
        </button>
    );
}
