"use client";

import Animales from "@/components/Animales";
import AsignarTarea from "@/components/AsignarTarea";
import EnviarNotificacion from "@/components/EnviarNotificacion";
import MisTareas from "@/components/MisTareas";
import NotificacionIcon from "@/components/NotificacionIcon";
import PanelNotificaciones from "@/components/PanelNotificaciones";
import RespuestasVoluntarios from "@/components/RespuestasVoluntarios";
import VoluntarioAnimales from "@/components/VoluntarioAnimales";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    FaHandsHelping,
    FaHome,
    FaPaw,
    FaSignOutAlt,
    FaUserCircle,
    FaUsers
} from "react-icons/fa";

export default function DashboardPage() {
    const router = useRouter();
    const [refugio, setRefugio] = useState(null);
    const [voluntario, setVoluntario] = useState(null);
    const [vista, setVista] = useState("tareas");
    const [mostrarPanel, setMostrarPanel] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                router.push("/login");
            } else {
                const { data: refugioData } = await supabase
                    .from("refugios")
                    .select("id, name, location, contact_info, description")
                    .eq("user_id", user.id)
                    .single();

                if (refugioData) {
                    setRefugio(refugioData);
                    return;
                }

                const { data: voluntarioData } = await supabase
                    .from("voluntarios")
                    .select("*, refugio:refugio_id(name)")
                    .eq("user_id", user.id)
                    .single();

                if (voluntarioData) {
                    setVoluntario(voluntarioData);
                }
            }
        });
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (voluntario) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-100 p-10 relative">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-3xl font-bold text-green-700">¡Hola, {voluntario.name}!</h1>
                    </div>

                    <NotificacionIcon voluntarioId={voluntario.id} onClick={() => setMostrarPanel(!mostrarPanel)} />
                    {mostrarPanel && <PanelNotificaciones voluntarioId={voluntario.id} />}


                    {/* Menú horizontal para voluntarios */}
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
                    </div>

                    {/* Contenido dinámico */}
                    {vista === "tareas" && <MisTareas />}
                    {vista === "animales" && <VoluntarioAnimales />}

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

    if (!refugio) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <h2 className="text-xl font-semibold text-gray-800">Cargando dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100">
            <nav className="w-full bg-white/80 shadow-2xl py-4 px-10 flex items-center justify-between fixed top-0 left-0 z-20 backdrop-blur-lg border-b-2 border-blue-200 animate-slide-down">
                <div className="flex items-center gap-4">
                    <FaHome className="text-blue-600 text-3xl drop-shadow" />
                    <span className="text-2xl font-extrabold text-blue-700 tracking-wide drop-shadow-lg">RefuGest</span>
                    <span className="ml-6 px-5 py-1 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow text-lg border-2 border-yellow-200 animate-pulse">
                        {refugio.name}
                    </span>
                </div>
                <ul className="flex gap-8 items-center">
                    <li><Link href="/dashboard" className="flex items-center gap-2 text-blue-700 hover:text-pink-500 font-bold transition text-lg"><FaHome /> Inicio</Link></li>
                    <li><Link href="/dashboard/animales" className="flex items-center gap-2 text-purple-700 hover:text-pink-500 font-bold transition text-lg"><FaPaw /> Animales</Link></li>
                    <li><Link href="/dashboard/voluntarios" className="flex items-center gap-2 text-green-700 hover:text-pink-500 font-bold transition text-lg"><FaHandsHelping /> Voluntarios</Link></li>
                    <li><Link href="/dashboard/adoptantes" className="flex items-center gap-2 text-pink-700 hover:text-blue-500 font-bold transition text-lg"><FaUsers /> Adoptantes</Link></li>
                    <li><Link href="/dashboard/perfil" className="flex items-center gap-2 text-gray-700 hover:text-blue-500 font-bold transition text-lg"><FaUserCircle /> Perfil</Link></li>
                </ul>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105">
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </nav>

            <div className="h-24" />

            <div className="flex flex-col items-center justify-center">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-10 mt-8 w-full max-w-2xl border-2 border-blue-200 animate-fade-in">
                    <h1 className="text-4xl font-extrabold mb-2 text-blue-700 drop-shadow-lg">{refugio.name}</h1>
                    <p className="mb-2 text-gray-900 text-lg">{refugio.description}</p>
                    <p className="mb-2 text-gray-800"><span className="font-semibold">Ubicación:</span> {refugio.location}</p>
                    <p className="mb-2 text-gray-800"><span className="font-semibold">Contacto:</span> {refugio.contact_info}</p>
                    <p className="mt-4 text-gray-900 text-lg">¡Bienvenido! Aquí podrás gestionar animales, voluntarios y adoptantes.</p>
                    <Animales refugioId={refugio.id} />
                    <div className="mt-8">
                        <AsignarTarea refugioId={refugio.id} />
                        <EnviarNotificacion refugioId={refugio.id} />
                        <RespuestasVoluntarios refugioId={refugio.id} />

                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease;
                }
                @keyframes slide-down {
                    from { transform: translateY(-40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down {
                    animation: slide-down 0.8s cubic-bezier(.4,2,.6,1) 0.1s both;
                }
            `}</style>
        </div>
    );
}
