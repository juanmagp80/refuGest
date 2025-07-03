"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RefugioPage() {
    const params = useParams();
    const [refugio, setRefugio] = useState(null);
    const [animales, setAnimales] = useState([]);

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-100 via-yellow-100 to-white font-sans relative">
            {/* Menú lateral izquierdo */}
            <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-white shadow-lg overflow-y-auto p-4 z-30 border-r border-orange-200 space-y-6">
                {/* Información general */}
                <div>
                    <h3 className="text-orange-600 font-bold text-lg mb-2 border-b border-orange-300 pb-1">Información general</h3>
                    <ul className="space-y-2 text-sm text-gray-800 font-medium">
                        <li><Link href="/">Inicio</Link></li>
                        <li><a href="#asociacion">La Asociación</a></li>
                        <li><a href="#redes">Redes Sociales</a></li>
                        <li><a href="#albergue">Nuestro albergue</a></li>
                        <li><a href="#manuales">Manuales de ayuda</a></li>
                        <li><a href="#colaboradores">Profesionales colaboradores</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                        <li><a href="#calendario">Calendario de Google</a></li>
                    </ul>
                </div>

                {/* Animales */}
                <div>
                    <h3 className="text-orange-600 font-bold text-lg mb-2 border-b border-orange-300 pb-1">Animales</h3>
                    <ul className="space-y-2 text-sm text-gray-800 font-medium">
                        <li><a href="#perros">Perros en adopción</a></li>
                        <li><a href="#gatos">Gatos en adopción</a></li>
                        <li><a href="#urgentes">Casos urgentes</a></li>
                        <li><a href="#adoptados">Animales adoptados</a></li>
                    </ul>
                </div>

                {/* Buscador */}
                <div>
                    <h3 className="text-orange-600 font-bold text-lg mb-2 border-b border-orange-300 pb-1">Buscador de animales</h3>
                    <div className="flex flex-col gap-2 text-sm">
                        <input type="text" placeholder="Nombre..." className="border border-gray-300 rounded px-3 py-1" />
                        <input type="text" placeholder="Especie..." className="border border-gray-300 rounded px-3 py-1" />
                        <select className="border border-gray-300 rounded px-3 py-1">
                            <option>Estado</option>
                            <option>Disponible</option>
                            <option>En espera</option>
                            <option>Adoptado</option>
                        </select>
                        <select className="border border-gray-300 rounded px-3 py-1">
                            <option>Sexo</option>
                            <option>Hembra</option>
                            <option>Macho</option>
                        </select>
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded mt-2">
                            Buscar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Menú lateral derecho ayudanos */}
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







                {/* Información adicional para móviles */}
                {refugio.info_lateral && (
                    <div id="info" className="lg:hidden bg-white rounded-xl shadow p-6 mb-10 border border-orange-100">
                        <h2 className="text-xl font-bold text-orange-700 mb-2">Información del refugio</h2>
                        <p className="text-gray-700 whitespace-pre-line">{refugio.info_lateral}</p>
                    </div>
                )}
            </main>
        </div>
    );
}
