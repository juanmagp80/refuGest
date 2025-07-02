"use client";

import AnimalesParaAdoptar from "@/components/AnimalesParaAdoptar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaFolderOpen, FaListAlt, FaPaw } from "react-icons/fa";

export default function DashboardAdoptante({ adoptante }) {
    const [vista, setVista] = useState("animales");
    const [solicitudes, setSolicitudes] = useState([]);

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    const fetchSolicitudes = async () => {
        const { data, error } = await supabase
            .from("solicitudes_adopcion")
            .select("*, animal:animal_id(name, especie, foto_url)")
            .eq("adoptante_id", adoptante.id)
            .order("created_at", { ascending: false });

        if (!error) setSolicitudes(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-4 sm:p-6 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-700 mb-6 text-center sm:text-left">
                Hola, {adoptante.name} 🐶
            </h1>

            <nav className="flex flex-wrap justify-center sm:justify-start gap-3 mb-8">
                <TabButton
                    active={vista === "animales"}
                    onClick={() => setVista("animales")}
                    icon={<FaPaw />}
                    label="Animales en adopción"
                    activeColor="bg-purple-600 text-white"
                    inactiveColor="bg-gray-200 text-gray-700"
                />
                <TabButton
                    active={vista === "solicitudes"}
                    onClick={() => setVista("solicitudes")}
                    icon={<FaListAlt />}
                    label="Mis solicitudes"
                    activeColor="bg-green-600 text-white"
                    inactiveColor="bg-gray-200 text-gray-700"
                />
                <TabButton
                    active={vista === "recursos"}
                    onClick={() => setVista("recursos")}
                    icon={<FaFolderOpen />}
                    label="Consejos útiles"
                    activeColor="bg-blue-600 text-white"
                    inactiveColor="bg-gray-200 text-gray-700"
                />
            </nav>

            <section>
                {vista === "animales" && (
                    <AnimalesParaAdoptar
                        adoptanteId={adoptante.id}
                        onSolicitudEnviada={fetchSolicitudes}
                    />
                )}

                {vista === "solicitudes" && (
                    <ul className="space-y-4 max-w-3xl mx-auto">
                        {solicitudes.length === 0 && (
                            <p className="text-center text-gray-600 italic">
                                No tienes solicitudes realizadas.
                            </p>
                        )}
                        {solicitudes.map((s) => (
                            <li
                                key={s.id}
                                className="bg-white p-4 rounded shadow flex items-center gap-4"
                            >
                                <img
                                    src={s.animal.foto_url}
                                    alt={s.animal.name}
                                    className="w-20 h-20 rounded object-cover flex-shrink-0"
                                />
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-lg">
                                        {s.animal.name} ({s.animal.especie})
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Estado: <span className="font-semibold">{s.estado}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Solicitada el {new Date(s.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {vista === "recursos" && (
                    <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto text-gray-800">
                        <h2 className="text-xl font-bold mb-4">Consejos para la adopción</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Prepárate para una adaptación gradual del animal a tu hogar.</li>
                            <li>Ten listo un espacio seguro y tranquilo donde se sienta cómodo.</li>
                            <li>Consulta con el refugio ante cualquier duda de salud o comportamiento.</li>
                            <li>Acude al veterinario en los primeros días para una revisión general.</li>
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}

function TabButton({ active, onClick, icon, label, activeColor, inactiveColor }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold transition focus:outline-none focus:ring-4 focus:ring-opacity-50 select-none
        ${active ? activeColor : inactiveColor}
      `}
            aria-pressed={active}
            type="button"
        >
            <span className="text-lg">{icon}</span>
            {label}
        </button>
    );
}
