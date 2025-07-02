"use client";

import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaCalendarAlt,
    FaCat,
    FaCheckCircle,
    FaDog,
    FaIdBadge,
    FaInfoCircle,
    FaNotesMedical,
    FaSyringe,
    FaUserMd,
    FaVenusMars,
} from "react-icons/fa";

export default function FichaAnimal() {
    const params = useParams();
    const { id } = params;
    console.log("ID recibido:", id);

    const [animal, setAnimal] = useState(null);

    useEffect(() => {
        const fetchAnimal = async () => {
            const { data, error } = await supabase
                .from("animales")
                .select("*, refugios:refugio_id(name, provincia)")
                .eq("id", id)
                .single();
            console.log("Animal cargado:", data);

            if (!error) setAnimal(data);
        };
        fetchAnimal();
    }, [id]);

    if (!animal)
        return <div className="text-center mt-10">Cargando ficha...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 animate-fade-in p-4">
            <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 max-w-md w-full flex flex-col gap-6 border-2 border-blue-200 animate-slide-up">
                {/* Imagen y nombre */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        {animal.imagen ? (
                            <img
                                src={animal.imagen}
                                alt={animal.name}
                                className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-full border-4 border-blue-400 shadow-xl transition-transform duration-300 hover:scale-105"
                            />
                        ) : (
                            <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-purple-200 border-4 border-blue-400 shadow-xl text-5xl sm:text-6xl text-white">
                                {animal.species?.toLowerCase() === "perro" ? (
                                    <FaDog />
                                ) : (
                                    <FaCat />
                                )}
                            </div>
                        )}
                        <span className="absolute bottom-2 right-2 bg-white/80 rounded-full px-3 py-1 text-blue-700 font-bold shadow text-base sm:text-lg flex items-center gap-1">
                            {animal.species?.toLowerCase() === "perro" ? (
                                <FaDog />
                            ) : (
                                <FaCat />
                            )}{" "}
                            {animal.species}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg flex items-center gap-2">
                        {animal.name}
                    </h1>
                    <span className="text-lg sm:text-xl text-purple-600 font-semibold text-center">
                        {animal.breed}
                    </span>
                </div>

                {/* Datos */}
                <div className="grid grid-cols-1 gap-4 text-black text-base sm:text-lg">
                    <Item icon={<FaCalendarAlt className="text-blue-400" />} label="Nombre del Refugio:" value={animal.refugios?.name} />
                    <Item icon={<FaCalendarAlt className="text-blue-400" />} label="Provincia:" value={animal.refugios?.provincia} />
                    <Item icon={<FaCalendarAlt className="text-blue-400" />} label="Edad:" value={animal.edad} />
                    <Item icon={<FaVenusMars className="text-pink-400" />} label="Sexo:" value={animal.sexo} />
                    <Item icon={<FaInfoCircle className="text-purple-400" />} label="Descripción:" value={animal.descripcion} />
                    <Item icon={<FaIdBadge className="text-blue-300" />} label="Chip:" value={animal.chip} />
                    <Item icon={<FaCheckCircle className="text-green-400" />} label="Esterilizado:" value={animal.esterilizado ? "Sí" : "No"} />
                    <Item icon={<FaSyringe className="text-green-500" />} label="Vacunas:" value={animal.vacunas} />
                    <Item icon={<FaNotesMedical className="text-red-400" />} label="Enfermedades:" value={animal.enfermedades} />
                    <Item icon={<FaNotesMedical className="text-purple-400" />} label="Tratamientos:" value={animal.tratamientos} />
                    <Item icon={<FaCalendarAlt className="text-blue-400" />} label="Última visita:" value={animal.ultima_visita} />
                    <Item icon={<FaUserMd className="text-green-400" />} label="Veterinario:" value={animal.veterinario} />
                    <Item icon={<FaInfoCircle className="text-yellow-400" />} label="Observaciones:" value={animal.observaciones} />
                </div>
            </div>

            <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease;
        }
        @keyframes slide-up {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.4, 2, 0.6, 1) 0.1s both;
        }
      `}</style>
        </div>
    );
}

function Item({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1">{icon}</div>
            <p className="flex-1">
                <b>{label}</b> {value || <span className="text-gray-400 italic">No disponible</span>}
            </p>
        </div>
    );
}
