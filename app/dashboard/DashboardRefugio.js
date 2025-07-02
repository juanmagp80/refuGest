"use client";

import GestionSolicitudesAdopcion from "@/components/GestionSolicitudesAdopcion";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaClipboardList // icono para solicitudes
    ,
    FaHandsHelping,
    FaPaw,
    FaSignOutAlt,
    FaUserCircle
} from "react-icons/fa";

export default function DashboardRefugio({ refugio }) {
    const router = useRouter();
    const [voluntarios, setVoluntarios] = useState([]);
    const [animales, setAnimales] = useState([]);
    const [tareasCompletadas, setTareasCompletadas] = useState([]);
    const [vista, setVista] = useState("inicio");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            const { data: voluntariosData } = await supabase
                .from("voluntarios")
                .select("id, name, created_at")
                .eq("refugio_id", refugio.id)
                .order("created_at", { ascending: false })
                .limit(5);

            const { data: animalesData } = await supabase
                .from("animales")
                .select("id, nombre, especie, foto_url, created_at")
                .eq("refugio_id", refugio.id)
                .order("created_at", { ascending: false })
                .limit(5);

            const { data: tareasData } = await supabase
                .from("tareas_voluntarios")
                .select("id, titulo, estado, updated_at")
                .eq("refugio_id", refugio.id)
                .eq("estado", "completada")
                .order("updated_at", { ascending: false })
                .limit(5);

            setVoluntarios(voluntariosData || []);
            setAnimales(animalesData || []);
            setTareasCompletadas(tareasData || []);

            setLoading(false);
        }
        fetchData();
    }, [refugio.id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const renderVista = () => {
        switch (vista) {
            case "inicio":
                return (
                    <>
                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-purple-800 mb-6">🐾 Últimos animales registrados</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {animales.map((a) => (
                                    <div key={a.id} className="bg-purple-100 border border-purple-300 rounded-xl p-4 shadow-lg flex items-center gap-4">
                                        <img
                                            src={a.foto_url || "/animal-placeholder.png"}
                                            alt={a.nombre}
                                            className="w-20 h-20 object-cover rounded-full border-4 border-purple-300 shadow-md"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold text-purple-700">{a.nombre}</h3>
                                            <p className="text-purple-900">{a.especie}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-blue-800 mb-6">🧑‍🤝‍🧑 Últimos voluntarios añadidos</h2>
                            <ul className="space-y-2 text-blue-900 font-medium">
                                {voluntarios.map((v) => (
                                    <li key={v.id} className="bg-blue-100 px-4 py-2 rounded-xl shadow">{v.name}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-700 mb-6">📦 Últimas adopciones</h2>
                            <p className="text-gray-600 italic">Esta sección estará disponible próximamente.</p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-3xl font-bold text-green-800 mb-6">✅ Últimas tareas completadas</h2>
                            <ul className="space-y-2 text-green-900 font-medium">
                                {tareasCompletadas.map((t) => (
                                    <li key={t.id} className="bg-green-100 px-4 py-2 rounded-xl shadow">{t.titulo}</li>
                                ))}
                            </ul>
                        </section>
                    </>
                );
            case "perfil":
                return (
                    <div className="mt-6 text-gray-800">
                        <p><strong>Nombre:</strong> {refugio.name}</p>
                        <p><strong>Descripción:</strong> {refugio.description}</p>
                        <p><strong>Ubicación:</strong> {refugio.location}</p>
                        <p><strong>Contacto:</strong> {refugio.contact_info}</p>
                    </div>
                );
            case "solicitudes":
                return (
                    <GestionSolicitudesAdopcion refugioId={refugio.id} />
                );
            default:
                return null;
        }
    };

    if (loading) return <p className="text-center mt-10">Cargando resumen del refugio...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100 p-10">
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10 border border-blue-300">
                <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 drop-shadow-xl">
                    {refugio.name}
                </h1>

                {/* Menú de navegación */}
                <div className="flex flex-wrap gap-4 justify-center mb-10">
                    <button
                        onClick={() => setVista("inicio")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition text-lg shadow-md ${vista === "inicio" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-purple-300"}`}
                    >
                        <FaPaw /> Inicio
                    </button>
                    <button
                        onClick={() => router.push("/dashboard/animales")}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-purple-300 transition text-lg shadow-md"
                    >
                        <FaPaw /> Animales
                    </button>
                    <button
                        onClick={() => router.push("/dashboard/voluntarios")}
                        className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-green-300 transition text-lg shadow-md"
                    >
                        <FaHandsHelping /> Voluntarios
                    </button>
                    <button
                        onClick={() => setVista("solicitudes")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition text-lg shadow-md ${vista === "solicitudes" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-yellow-300"}`}
                    >
                        <FaClipboardList /> Solicitudes de adopción
                    </button>
                    <button
                        onClick={() => setVista("perfil")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition text-lg shadow-md ${vista === "perfil" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-300"}`}
                    >
                        <FaUserCircle /> Perfil
                    </button>
                </div>

                {/* Contenido dinámico */}
                {renderVista()}

                <button
                    onClick={handleLogout}
                    className="mt-12 mx-auto flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:scale-105 transition text-white px-6 py-3 rounded-full font-bold shadow-lg text-lg"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}
