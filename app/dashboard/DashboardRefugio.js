"use client";

import GestionSolicitudesAdopcion from "@/components/GestionSolicitudesAdopcion";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaCat,
    FaClipboardList,
    FaDog,
    FaHandsHelping,
    FaPaw,
    FaSignOutAlt,
    FaUserCircle,
} from "react-icons/fa";
import PerfilRefugio from "./PerfilRefugio";

export default function DashboardRefugio({ refugio: initialRefugio }) {
    const router = useRouter();
    const [voluntarios, setVoluntarios] = useState([]);
    const [animales, setAnimales] = useState([]);
    const [tareasCompletadas, setTareasCompletadas] = useState([]);
    const [vista, setVista] = useState("inicio");
    const [loading, setLoading] = useState(true);
    const [refugio, setRefugio] = useState(initialRefugio);

    useEffect(() => {
        const fetchAnimales = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) return;

                const { data: refugio } = await supabase
                    .from("refugios")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();

                const { data: animalesData } = await supabase
                    .from("animales")
                    .select("*")
                    .eq("refugio_id", refugio.id)
                    .order("created_at", { ascending: false });

                setAnimales(animalesData);
            } catch (e) {
                console.error("Error cargando datos:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimales();
    }, []);

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
                            <h2 className="text-3xl font-bold text-blue-500 mb-6 flex items-center gap-2">
                                <FaPaw className="text-blue-200" /> Últimos animales registrados
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {animales.length === 0 ? (
                                    <p className="text-center col-span-full text-gray-500 italic">
                                        No hay animales registrados aún.
                                    </p>
                                ) : (
                                    animales.slice(0, 6).map((a) => (
                                        <Link href={`/animal/${a.id}`} key={a.id} className="block hover:scale-[1.02] transition-transform">
                                            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-md flex items-center gap-4">
                                                {a.imagen ? (
                                                    <img
                                                        src={a.imagen}
                                                        alt={a.name}
                                                        className="w-24 h-24 object-cover rounded-full border-4 border-blue-300 shadow"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl text-blue-600">
                                                        {a.especie?.toLowerCase() === "perro" ? <FaDog /> : <FaCat />}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-2xl font-bold text-blue-500">{a.name}</h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge color="pink">{a.sexo}</Badge>
                                                        <Badge color="blue">{a.status || "Sin estado"}</Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">Especie: {a.especie || "No definida"}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-pink-800 mb-6 flex items-center gap-2">
                                <FaHandsHelping className="text-pink-500" /> Últimos voluntarios añadidos
                            </h2>
                            {voluntarios.length === 0 ? (
                                <p className="text-center text-gray-500 italic">No hay voluntarios añadidos aún.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {voluntarios.map((v) => (
                                        <div key={v.id} className="bg-white border border-pink-200 rounded-2xl p-4 shadow-md flex items-center gap-4">
                                            <FaHandsHelping className="text-3xl text-pink-500" />
                                            <span className="text-pink-800 font-semibold">{v.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="mb-12">
                            <h2 className="text-3xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                                📦 Últimas adopciones
                            </h2>
                            <p className="text-gray-600 italic">
                                Esta sección estará disponible próximamente.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
                                ✅ Últimas tareas completadas
                            </h2>
                            {tareasCompletadas.length === 0 ? (
                                <p className="text-center text-gray-500 italic">
                                    No hay tareas completadas recientemente.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {tareasCompletadas.map((t) => (
                                        <div key={t.id} className="bg-white border border-green-200 rounded-2xl p-4 shadow-md">
                                            <p className="text-green-800 font-semibold">{t.titulo}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                );

            case "perfil":
                return <PerfilRefugio refugio={refugio} setRefugio={setRefugio} />;

            case "solicitudes":
                return <GestionSolicitudesAdopcion refugioId={refugio.id} />;

            default:
                return null;
        }
    };

    if (loading)
        return <p className="text-center mt-10 text-gray-600">Cargando resumen del refugio...</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 sm:p-10">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-blue-100 ring-1 ring-blue-200">
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 drop-shadow-xl text-center sm:text-left">
                    {refugio.name}
                </h1>

                {/* Menú de navegación */}
                <nav className="flex flex-wrap gap-4 justify-center sm:justify-start mb-6">
                    <NavButton
                        active={vista === "inicio"}
                        onClick={() => setVista("inicio")}
                        icon={<FaPaw />}
                        label="Inicio"
                        activeColor="bg-purple-600 text-white"
                        inactiveColor="bg-gray-200 text-gray-700 hover:bg-purple-300"
                    />
                    <NavButton
                        onClick={() => router.push("/dashboard/animales")}
                        icon={<FaPaw />}
                        label="Animales"
                        inactiveColor="bg-gray-200 text-gray-700 hover:bg-purple-300"
                    />
                    <NavButton
                        onClick={() => router.push("/dashboard/voluntarios")}
                        icon={<FaHandsHelping />}
                        label="Voluntarios"
                        inactiveColor="bg-gray-200 text-gray-700 hover:bg-green-300"
                    />
                    <NavButton
                        active={vista === "solicitudes"}
                        onClick={() => setVista("solicitudes")}
                        icon={<FaClipboardList />}
                        label="Solicitudes de adopción"
                        activeColor="bg-yellow-500 text-white"
                        inactiveColor="bg-gray-200 text-gray-700 hover:bg-yellow-300"
                    />
                    <NavButton
                        active={vista === "perfil"}
                        onClick={() => setVista("perfil")}
                        icon={<FaUserCircle />}
                        label="Perfil"
                        activeColor="bg-blue-600 text-white"
                        inactiveColor="bg-gray-200 text-gray-700 hover:bg-blue-300"
                    />
                </nav>

                {/* Contenido dinámico */}
                <main>{renderVista()}</main>

                <button
                    onClick={handleLogout}
                    className="mt-12 mx-auto flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:scale-105 transition transform text-white px-6 py-3 rounded-full font-bold shadow-lg text-lg"
                    type="button"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}

function NavButton({ active, onClick, icon, label, activeColor, inactiveColor }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-lg shadow-md transition focus:outline-none focus:ring-4 focus:ring-opacity-50 select-none ${active ? activeColor : inactiveColor}`}
            type="button"
            aria-pressed={active}
        >
            <span className="text-xl">{icon}</span>
            {label}
        </button>
    );
}

function Badge({ children, color }) {
    const colors = {
        pink: "bg-pink-100 text-pink-800",
        blue: "bg-blue-100 text-blue-800",
        purple: "bg-purple-100 text-purple-800",
    };
    return (
        <span className={`px-3 py-1 text-sm rounded-full font-medium ${colors[color]}`}>
            {children}
        </span>
    );
}
