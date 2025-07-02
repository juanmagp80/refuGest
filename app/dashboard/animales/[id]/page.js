"use client";

import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaCalendarAlt, FaCat, FaCheckCircle, FaDog, FaIdBadge, FaInfoCircle,
    FaNotesMedical, FaSyringe, FaUserMd, FaVenusMars
} from "react-icons/fa";

export default function EditarAnimalPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchAnimal = async () => {
            const { data, error } = await supabase.from("animales").select("*").eq("id", id).single();
            if (error) {
                setError("No se pudo cargar el animal.");
            } else {
                setForm(data);
            }
            setLoading(false);
        };
        fetchAnimal();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { error: updateError } = await supabase
            .from("animales")
            .update({ ...form })
            .eq("id", id);

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess("Animal actualizado correctamente.");
            setTimeout(() => router.push("/dashboard/animales"), 1500);
        }
    };

    const openCloudinaryWidget = () => {
        window.cloudinary.openUploadWidget(
            {
                cloudName: "dmx84o0ye",
                uploadPreset: "animales",
                sources: ["local", "url", "camera"],
                multiple: false,
                cropping: false,
                defaultSource: "local"
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setForm({ ...form, imagen: result.info.secure_url });
                }
            }
        );
    };

    if (loading) return <p className="p-8 text-center">Cargando...</p>;
    if (!form) return <p className="p-8 text-center text-red-600">{error || "Animal no encontrado"}</p>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100 animate-fade-in p-4 flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 w-full max-w-lg flex flex-col gap-6 border-2 border-blue-200 animate-slide-up"
            >
                <div className="flex flex-col items-center mb-4">
                    <div className="flex items-center gap-2 text-4xl text-yellow-600 drop-shadow-lg">
                        <FaDog />
                        <FaCat />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 text-blue-700 tracking-tight drop-shadow-lg text-center">
                        Editar animal
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 text-center">Actualiza los datos del animal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="name" icon={<FaIdBadge />} placeholder="Nombre" value={form.name} onChange={handleChange} />
                    <Input name="species" icon={<FaDog />} placeholder="Especie" value={form.species} onChange={handleChange} />
                    <Input name="breed" icon={<FaInfoCircle />} placeholder="Raza" value={form.breed} onChange={handleChange} />
                    <Input name="edad" icon={<FaCalendarAlt />} placeholder="Edad" value={form.edad} onChange={handleChange} />
                    <Input name="sexo" icon={<FaVenusMars />} placeholder="Sexo" value={form.sexo} onChange={handleChange} />
                    <Input name="chip" icon={<FaIdBadge />} placeholder="Nº Chip" value={form.chip} onChange={handleChange} />
                    <Input name="ultima_visita" type="date" icon={<FaCalendarAlt />} value={form.ultima_visita || ""} onChange={handleChange} />
                    <Input name="veterinario" icon={<FaUserMd />} placeholder="Veterinario" value={form.veterinario} onChange={handleChange} />
                </div>

                <label className="flex items-center gap-3 text-black font-medium">
                    <input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={handleChange} className="accent-blue-600 scale-125" />
                    Esterilizado
                </label>

                {/* Select para cambiar el estado */}
                <div className="relative w-full">
                    <span className="absolute left-3 top-3 text-blue-400">
                        <FaInfoCircle />
                    </span>
                    <select
                        name="status"
                        value={form.status || ""}
                        onChange={handleChange}
                        className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full"
                    >
                        <option value="">Selecciona un estado</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Adoptado">Adoptado</option>
                        <option value="En tratamiento">En tratamiento</option>
                        <option value="Reservado">Reservado</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={openCloudinaryWidget}
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded font-bold shadow transition-all duration-200"
                >
                    Cambiar imagen
                </button>

                {form.imagen && (
                    <div className="flex justify-center">
                        <img
                            src={form.imagen}
                            alt="Imagen del animal"
                            className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-blue-300 shadow-lg mt-2"
                        />
                    </div>
                )}

                <TextArea name="descripcion" icon={<FaInfoCircle />} placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
                <TextArea name="vacunas" icon={<FaSyringe />} placeholder="Vacunas" value={form.vacunas} onChange={handleChange} />
                <TextArea name="enfermedades" icon={<FaNotesMedical />} placeholder="Enfermedades" value={form.enfermedades} onChange={handleChange} />
                <TextArea name="tratamientos" icon={<FaNotesMedical />} placeholder="Tratamientos" value={form.tratamientos} onChange={handleChange} />
                <TextArea name="observaciones" icon={<FaInfoCircle />} placeholder="Observaciones" value={form.observaciones} onChange={handleChange} />

                {error && <p className="text-red-600 text-center">{error}</p>}
                {success && <p className="text-green-600 flex items-center gap-2 justify-center"><FaCheckCircle /> {success}</p>}

                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl mt-4 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Guardar cambios
                </button>
            </form>

            {/* Animaciones */}
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

function Input({ name, icon, ...props }) {
    return (
        <div className="relative w-full">
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <input
                name={name}
                {...props}
                className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full"
            />
        </div>
    );
}

function TextArea({ name, icon, ...props }) {
    return (
        <div className="relative w-full">
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <textarea
                name={name}
                {...props}
                className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-h-[60px] w-full"
            />
        </div>
    );
}
