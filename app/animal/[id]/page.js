"use client";

import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCat, FaCheckCircle, FaDog, FaIdBadge, FaInfoCircle, FaNotesMedical, FaSyringe, FaUserMd, FaVenusMars } from "react-icons/fa";

export default function FichaAnimal() {
    const params = useParams();
    const { id } = params;
    const [animal, setAnimal] = useState(null);

    useEffect(() => {
        const fetchAnimal = async () => {
            const { data, error } = await supabase
                .from("animales")
                .select("*")
                .eq("id", id)
                .single();
            if (!error) setAnimal(data);
        };
        fetchAnimal();
    }, [id]);

    if (!animal) return <div className="text-center mt-10">Cargando ficha...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 animate-fade-in">
            <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-xl w-full flex flex-col gap-6 border-2 border-blue-200 animate-slide-up">
                {/* Imagen y nombre */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        {animal.imagen ? (
                            <img
                                src={animal.imagen}
                                alt={animal.name}
                                className="w-44 h-44 object-cover rounded-full border-4 border-blue-400 shadow-xl transition-transform duration-300 hover:scale-105"
                            />
                        ) : (
                            <div className="w-44 h-44 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-purple-200 border-4 border-blue-400 shadow-xl text-6xl text-white">
                                {animal.species?.toLowerCase() === "perro" ? <FaDog /> : <FaCat />}
                            </div>
                        )}
                        <span className="absolute bottom-2 right-2 bg-white/80 rounded-full px-3 py-1 text-blue-700 font-bold shadow text-lg">
                            {animal.species?.toLowerCase() === "perro" ? <FaDog /> : <FaCat />} {animal.species}
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg flex items-center gap-2">
                        {animal.name}
                    </h1>
                    <span className="text-lg text-purple-600 font-semibold">{animal.breed}</span>
                </div>
                {/* Datos */}
                <div className="grid grid-cols-1 gap-3 text-black text-lg">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-400" /> <b>Edad:</b> {animal.edad}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaVenusMars className="text-pink-400" /> <b>Sexo:</b> {animal.sexo}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-purple-400" /> <b>Descripción:</b> {animal.descripcion}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaIdBadge className="text-blue-300" /> <b>Chip:</b> {animal.chip}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-400" /> <b>Esterilizado:</b> {animal.esterilizado ? "Sí" : "No"}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaSyringe className="text-green-500" /> <b>Vacunas:</b> {animal.vacunas}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaNotesMedical className="text-red-400" /> <b>Enfermedades:</b> {animal.enfermedades}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaNotesMedical className="text-purple-400" /> <b>Tratamientos:</b> {animal.tratamientos}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-400" /> <b>Última visita:</b> {animal.ultima_visita}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaUserMd className="text-green-400" /> <b>Veterinario:</b> {animal.veterinario}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaInfoCircle className="text-yellow-400" /> <b>Observaciones:</b> {animal.observaciones}
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
                @keyframes slide-up {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s cubic-bezier(.4,2,.6,1) 0.1s both;
                }
            `}</style>
        </div>
    );
}