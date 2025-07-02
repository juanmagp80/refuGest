"use client";

import AnimalesParaAdoptar from "@/components/AnimalesParaAdoptar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaFolderOpen, FaListAlt, FaPaw } from "react-icons/fa";

export default function DashboardAdoptante({ adoptante }) {
    const [vista, setVista] = useState("animales");
    const [animales, setAnimales] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

    useEffect(() => {
        fetchAnimales();
        fetchSolicitudes();
    }, []);

    const fetchAnimales = async () => {
        const { data, error } = await supabase
            .from("animales")
            .select("id, name, especie, edad, foto_url, descripcion, estado")
            .eq("estado", "Disponible");

        if (!error) setAnimales(data);
    };

    const fetchSolicitudes = async () => {
        const { data, error } = await supabase
            .from("solicitudes_adopcion")
            .select("*, animal:animal_id(name, especie, foto_url)")
            .eq("adoptante_id", adoptante.id)
            .order("created_at", { ascending: false });

        if (!error) setSolicitudes(data);
    };

    const enviarSolicitud = async (animalId) => {
        const { error } = await supabase.from("solicitudes_adopcion").insert({
            adoptante_id: adoptanteId,
            animal_id: animalId,
            estado: "Pendiente",
        });
        if (!error) {
            alert("Solicitud enviada correctamente.");
            if (onSolicitudEnviada) onSolicitudEnviada();
        }
    };


    const renderAnimales = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {animales.map((animal) => (
                <div
                    key={animal.id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                    onClick={() => setAnimalSeleccionado(animal)}
                >
                    <img src={animal.foto_url} alt={animal.name} className="w-full h-48 object-cover rounded mb-2" />
                    <h3 className="text-lg font-bold text-gray-800">{animal.name}</h3>
                    <p className="text-sm text-gray-600">{animal.especie} - {animal.edad}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{animal.descripcion}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            enviarSolicitud(animal.id);
                        }}
                        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                        Quiero adoptarlo
                    </button>
                </div>
            ))}
        </div>
    );

    const renderSolicitudes = () => (
        <ul className="space-y-4">
            {solicitudes.map((s) => (
                <li key={s.id} className="bg-white p-4 rounded shadow">
                    <div className="flex items-center gap-4">
                        <img src={s.animal.foto_url} alt={s.animal.name} className="w-20 h-20 rounded object-cover" />
                        <div>
                            <h4 className="font-bold text-lg">{s.animal.name} ({s.animal.especie})</h4>
                            <p className="text-sm text-gray-600">Estado: <span className="font-semibold">{s.estado}</span></p>
                            <p className="text-sm text-gray-400">Solicitada el {new Date(s.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-6">
            <h1 className="text-3xl font-extrabold text-purple-700 mb-6">Hola, {adoptante.name} 🐶</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setVista("animales")}
                    className={`px-4 py-2 rounded-full font-bold transition ${vista === "animales" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    <FaPaw className="inline-block mr-2" /> Animales en adopción
                </button>
                <button
                    onClick={() => setVista("solicitudes")}
                    className={`px-4 py-2 rounded-full font-bold transition ${vista === "solicitudes" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    <FaListAlt className="inline-block mr-2" /> Mis solicitudes
                </button>
                <button
                    onClick={() => setVista("recursos")}
                    className={`px-4 py-2 rounded-full font-bold transition ${vista === "recursos" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                >
                    <FaFolderOpen className="inline-block mr-2" /> Consejos útiles
                </button>
            </div>

            {vista === "animales" && (
                <AnimalesParaAdoptar
                    adoptanteId={adoptante.id}
                    onSolicitudEnviada={fetchSolicitudes}
                />
            )}
            {vista === "solicitudes" && renderSolicitudes()}
            {vista === "recursos" && (
                <div className="bg-white p-6 rounded shadow text-gray-800">
                    <h2 className="text-xl font-bold mb-4">Consejos para la adopción</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Prepárate para una adaptación gradual del animal a tu hogar.</li>
                        <li>Ten listo un espacio seguro y tranquilo donde se sienta cómodo.</li>
                        <li>Consulta con el refugio ante cualquier duda de salud o comportamiento.</li>
                        <li>Acude al veterinario en los primeros días para una revisión general.</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
