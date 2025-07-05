"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RefugioPage() {
    const params = useParams();
    const [refugio, setRefugio] = useState(null);
    const [animales, setAnimales] = useState([]);
    const [seccion, setSeccion] = useState("principal");

    useEffect(() => {
        const fetchRefugio = async () => {
            const { data, error } = await supabase
                .from("refugios")
                .select("*")
                .eq("id", params.id)
                .single();
            if (!error && data) setRefugio(data);
        };

        const fetchAnimales = async () => {
            const { data, error } = await supabase
                .from("animales")
                .select("*")
                .eq("refugio_id", params.id)
                .eq("status", "Disponible")
                .order("created_at", { ascending: false });
            if (!error && data) setAnimales(data);
        };

        fetchRefugio();
        fetchAnimales();
    }, [params.id]);

    if (!refugio) return <div className="text-center mt-10">Cargando refugio...</div>;

    // Helper para mostrar redes sociales si es JSON
    const renderRedesSociales = (redes) => {
        if (!redes) return null;
        try {
            const obj = typeof redes === "string" ? JSON.parse(redes) : redes;
            return (
                <ul className="flex flex-col gap-1 mt-1">
                    {Object.entries(obj).map(([red, url]) => (
                        <li key={red}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                                {red}
                            </a>
                        </li>
                    ))}
                </ul>
            );
        } catch {
            return <div className="text-xs text-gray-600">{redes}</div>;
        }
    };

    // Renderizado condicional de secciones
    const renderSeccion = () => {
        switch (seccion) {
            case "asociacion":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">La Asociación</h2>
                        <p className="text-gray-700 whitespace-pre-line">{refugio.asociacion || "Información no disponible."}</p>
                    </section>
                );
            case "redes":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Redes Sociales</h2>
                        {renderRedesSociales(refugio.redes_sociales) || <p className="text-gray-700">No hay redes sociales registradas.</p>}
                    </section>
                );
            case "albergue":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Nuestro albergue</h2>
                        <p className="text-gray-700 whitespace-pre-line">{refugio.albergue || "Información no disponible."}</p>
                    </section>
                );
            case "manuales":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Manuales de ayuda</h2>
                        <p className="text-gray-700 whitespace-pre-line">{refugio.manuales || "Información no disponible."}</p>
                    </section>
                );
            case "colaboradores":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Profesionales colaboradores</h2>
                        <p className="text-gray-700 whitespace-pre-line">{refugio.colaboradores || "Información no disponible."}</p>
                    </section>
                );
            case "contacto":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Contacto</h2>
                        <p className="text-gray-700 whitespace-pre-line">{refugio.contacto || "Información no disponible."}</p>
                    </section>
                );
            case "calendario":
                return (
                    <section>
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Calendario de Google</h2>
                        {refugio.calendario ? (
                            <iframe
                                src={refugio.calendario}
                                className="w-full h-96 border rounded"
                                title="Calendario"
                            ></iframe>
                        ) : (
                            <p className="text-gray-700">No hay calendario disponible.</p>
                        )}
                    </section>
                );
            case "principal":
            default:
                return (
                    <>
                        <div className="text-center mb-6">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-700">{refugio.name}</h1>
                            {refugio.descripcion && (
                                <p className="mt-2 text-gray-700 text-sm md:text-base">{refugio.descripcion}</p>
                            )}
                        </div>
                        {/* Animales disponibles */}
                        <div id="animales" className="mb-10">
                            <h2 className="text-2xl font-bold text-orange-700 mb-6">Animales en adopción</h2>
                            {animales.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {animales.map((animal) => (
                                        <Link key={animal.id} href={`/animal/${animal.id}`}>
                                            <div className="bg-white rounded-2xl border border-orange-100 shadow-md hover:shadow-xl transition duration-200 overflow-hidden cursor-pointer">
                                                <img
                                                    src={animal.imagen || "/images/default-animal.jpg"}
                                                    alt={animal.name}
                                                    className="w-full h-44 object-cover"
                                                />
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-orange-800">{animal.name}</h3>
                                                    <p className="text-sm text-purple-600">{animal.breed}</p>
                                                    <p className="text-sm text-gray-600 line-clamp-2">{animal.descripcion}</p>
                                                    <span
                                                        className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full
                          ${animal.status === "Disponible" ? "bg-green-100 text-green-700" : ""}
                          ${animal.status === "En espera" ? "bg-yellow-100 text-yellow-700" : ""}
                          ${animal.status === "Adoptado" ? "bg-gray-200 text-gray-700" : ""}
                        `}
                                                    >
                                                        {animal.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Este refugio no tiene animales disponibles.</p>
                            )}
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-100 via-yellow-100 to-white font-sans relative">
            {/* Menú lateral izquierdo */}
            <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-white shadow-lg overflow-y-auto p-4 z-30 border-r border-orange-200 space-y-6">
                <div>
                    <h3 className="text-orange-600 font-bold text-lg mb-2 border-b border-orange-300 pb-1">Información general</h3>
                    <ul className="space-y-2 text-sm text-gray-800 font-medium">
                        <li><button onClick={() => setSeccion("principal")}>Inicio</button></li>
                        <li><button onClick={() => setSeccion("asociacion")}>La Asociación</button></li>
                        <li><button onClick={() => setSeccion("redes")}>Redes Sociales</button></li>
                        <li><button onClick={() => setSeccion("albergue")}>Nuestro albergue</button></li>
                        <li><button onClick={() => setSeccion("manuales")}>Manuales de ayuda</button></li>
                        <li><button onClick={() => setSeccion("colaboradores")}>Profesionales colaboradores</button></li>
                        <li><button onClick={() => setSeccion("contacto")}>Contacto</button></li>
                        <li><button onClick={() => setSeccion("calendario")}>Calendario de Google</button></li>
                    </ul>
                </div>
            </aside>

            {/* Menú lateral derecho ayudanos (sin cambios) */}
            <aside className="hidden lg:flex flex-col fixed top-0 right-0 h-full w-60 bg-orange-100 border-l border-orange-300 px-4 py-6 z-30 text-sm overflow-y-auto">
                <h3 className="text-lg font-bold text-orange-700 mb-4">Ayúdanos</h3>
                <ul className="space-y-3 font-semibold text-orange-800">
                    <li><a href="#adopta" className="hover:underline">Adopta o acoge</a></li>
                    <li><a href="#socio" className="hover:underline">Hazte socio o padrino</a></li>
                    <li><a href="#voluntario" className="hover:underline">Hazte voluntario</a></li>
                    <li><a href="#difunde" className="hover:underline">Difunde</a></li>
                    <li><a href="#dona" className="hover:underline">Dona</a></li>
                </ul>
            </aside>

            {/* Banner principal */}
            <div
                className="w-full h-64 md:h-80 bg-cover bg-center relative shadow-md"
                style={{ backgroundImage: `url(${refugio.banner_url || "/images/default-banner.jpg"})` }}
            >
                {/* Logo circular sobre el banner */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-20">
                    <img
                        src={refugio.logo_url || "/images/default-logo.png"}
                        alt="Logo del refugio"
                        className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-full border-4 border-white shadow-lg bg-white"
                    />
                </div>
            </div>

            {/* Contenido principal */}
            <main className="lg:ml-64 lg:mr-60 px-4 mt-20 max-w-screen-xl mx-auto">
                {renderSeccion()}
            </main>
        </div>
    );
}