"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaCalendarAlt, FaCat, FaCheckCircle, FaDog, FaIdBadge, FaInfoCircle, FaNotesMedical, FaSyringe, FaUserMd, FaVenusMars } from "react-icons/fa";

export default function NuevoAnimalPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        nombre: "",
        especie: "",
        raza: "",
        edad: "",
        sexo: "",
        descripcion: "",
        chip: "",
        esterilizado: false,
        vacunas: "",
        enfermedades: "",
        tratamientos: "",
        ultima_visita: "",
        veterinario: "",
        observaciones: "",
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { data: { user } } = await supabase.auth.getUser();
        const { data: refugio } = await supabase
            .from("refugios")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!refugio) {
            setError("No se ha encontrado el refugio.");
            return;
        }

        const { error } = await supabase.from("animales").insert([{
            ...form,
            refugio_id: refugio.id,
        }]);

        if (error) {
            setError(error.message);
        } else {
            setSuccess("¡Animal registrado correctamente!");
            setTimeout(() => router.push("/dashboard/animales"), 1500);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100 animate-fade-in">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-2xl flex flex-col gap-6 border-2 border-blue-200 animate-slide-up"
            >
                <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center gap-2 text-4xl text-blue-600 drop-shadow-lg">
                        <FaDog />
                        <FaCat />
                    </div>
                    <h1 className="text-3xl font-extrabold mt-2 text-blue-700 tracking-tight drop-shadow-lg">Registrar nuevo animal</h1>
                    <p className="text-gray-500 text-sm mt-1">Completa todos los campos para añadir un nuevo amigo al refugio</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaIdBadge className="absolute left-3 top-3 text-blue-400" />
                        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                    </div>
                    <div className="relative">
                        <FaDog className="absolute left-3 top-3 text-purple-400" />
                        <input name="especie" placeholder="Especie" value={form.especie} onChange={handleChange} required className="text-black border-2 border-purple-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                    </div>
                    <div className="relative">
                        <FaInfoCircle className="absolute left-3 top-3 text-pink-400" />
                        <input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} className="text-black border-2 border-pink-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition" />
                    </div>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-green-400" />
                        <input name="edad" placeholder="Edad" value={form.edad} onChange={handleChange} className="text-black border-2 border-green-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                    </div>
                    <div className="relative">
                        <FaVenusMars className="absolute left-3 top-3 text-yellow-400" />
                        <input name="sexo" placeholder="Sexo" value={form.sexo} onChange={handleChange} className="text-black border-2 border-yellow-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" />
                    </div>
                    <div className="relative">
                        <FaIdBadge className="absolute left-3 top-3 text-blue-300" />
                        <input name="chip" placeholder="Nº Chip" value={form.chip} onChange={handleChange} className="text-black border-2 border-blue-100 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                    </div>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-purple-300" />
                        <input name="ultima_visita" type="date" placeholder="Última visita veterinario" value={form.ultima_visita} onChange={handleChange} className="border-2 border-purple-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
                    </div>
                    <div className="relative">
                        <FaUserMd className="absolute left-3 top-3 text-green-300" />
                        <input name="veterinario" placeholder="Veterinario habitual" value={form.veterinario} onChange={handleChange} className="text-black border-2 border-green-100 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition" />
                    </div>
                </div>
                <label className="flex items-center gap-2 text-black font-medium">
                    <input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={handleChange} className="accent-blue-600 scale-125" />
                    Esterilizado
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaInfoCircle className="absolute left-3 top-3 text-blue-300" />
                        <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="border-2 border-blue-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-300 transition min-h-[60px]" />
                    </div>
                    <div className="relative">
                        <FaSyringe className="absolute left-3 top-3 text-green-300" />
                        <textarea name="vacunas" placeholder="Vacunas (separadas por coma)" value={form.vacunas} onChange={handleChange} className="border-2 border-green-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-300 transition min-h-[60px]" />
                    </div>
                    <div className="relative">
                        <FaNotesMedical className="absolute left-3 top-3 text-red-300" />
                        <textarea name="enfermedades" placeholder="Enfermedades" value={form.enfermedades} onChange={handleChange} className="border-2 border-red-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-red-300 transition min-h-[60px]" />
                    </div>
                    <div className="relative">
                        <FaNotesMedical className="absolute left-3 top-3 text-purple-300" />
                        <textarea name="tratamientos" placeholder="Tratamientos" value={form.tratamientos} onChange={handleChange} className="border-2 border-purple-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-300 transition min-h-[60px]" />
                    </div>
                    <div className="relative md:col-span-2">
                        <FaInfoCircle className="absolute left-3 top-3 text-yellow-300" />
                        <textarea name="observaciones" placeholder="Observaciones" value={form.observaciones} onChange={handleChange} className="border-2 border-yellow-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-300 transition min-h-[60px]" />
                    </div>
                </div>
                {error && (
                    <p className="text-red-600 flex items-center gap-2 mt-2">
                        <FaNotesMedical /> {error}
                    </p>
                )}
                {success && (
                    <p className="text-green-600 flex items-center gap-2 mt-2">
                        <FaCheckCircle /> {success}
                    </p>
                )}
                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl mt-4 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Guardar animal
                </button>
            </form>
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