"use client";

import SidebarFichaAnimal from "@/components/SidebarFichaAnimal";
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

        <div className="min-h-screen bg-gray-100 p-4 flex flex-col md:flex-row ">
            <SidebarFichaAnimal id={id} />
            <div className="flex-1">

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6">

                    {/* Cabecera */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 border-b pb-6">
                        {form.imagen ? (
                            <img
                                src={form.imagen}
                                alt={form.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-300"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl text-blue-600">
                                {form.species?.toLowerCase() === "perro" ? <FaDog /> : <FaCat />}
                            </div>
                        )}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-3xl font-bold text-gray-800">{form.name}</h1>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                <Badge color="pink">{form.sexo}</Badge>
                                <Badge color="blue">{form.status || "Sin estado"}</Badge>
                            </div>
                            <p className="text-gray-600 mt-1">Edad: {form.edad}</p>
                        </div>
                    </div>

                    {/* Botón imagen */}
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={openCloudinaryWidget}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
                        >
                            Cambiar imagen
                        </button>
                    </div>

                    {/* Información básica */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Información básica</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input name="name" icon={<FaIdBadge />} placeholder="Nombre" value={form.name} onChange={handleChange} />
                            <div className="relative w-full">
                                <span className="absolute left-3 top-3 text-blue-400"><FaDog /></span>
                                <select
                                    name="species"
                                    value={form.species}
                                    onChange={handleChange}
                                    required
                                    className="appearance-none text-black border border-blue-200 rounded-lg px-9 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                >
                                    <option value="" disabled>Selecciona la especie</option>
                                    <option value="Perro">Perro</option>
                                    <option value="Gato">Gato</option>
                                    <option value="Conejo">Conejo</option>
                                    <option value="Ave">Ave</option>
                                    <option value="Roedor">Roedor</option>
                                    <option value="Reptil">Reptil</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <Input name="breed" icon={<FaInfoCircle />} placeholder="Raza" value={form.breed} onChange={handleChange} />
                            <Input name="edad" icon={<FaCalendarAlt />} placeholder="Edad" value={form.edad} onChange={handleChange} />
                            <Input name="sexo" icon={<FaVenusMars />} placeholder="Sexo" value={form.sexo} onChange={handleChange} />
                            <Input name="chip" icon={<FaIdBadge />} placeholder="Nº Chip" value={form.chip} onChange={handleChange} />
                        </div>
                    </section>

                    {/* Otros datos */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Salud y otros</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input name="ultima_visita" type="date" icon={<FaCalendarAlt />} value={form.ultima_visita || ""} onChange={handleChange} />
                            <Input name="veterinario" icon={<FaUserMd />} placeholder="Veterinario" value={form.veterinario} onChange={handleChange} />
                        </div>

                        <label className="flex items-center gap-3 text-black font-medium mt-4">
                            <input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={handleChange} className="accent-blue-600 scale-125" />
                            Esterilizado
                        </label>

                        <TextArea name="descripcion" icon={<FaInfoCircle />} placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
                        <TextArea name="vacunas" icon={<FaSyringe />} placeholder="Vacunas" value={form.vacunas} onChange={handleChange} />
                        <TextArea name="enfermedades" icon={<FaNotesMedical />} placeholder="Enfermedades" value={form.enfermedades} onChange={handleChange} />
                        <TextArea name="tratamientos" icon={<FaNotesMedical />} placeholder="Tratamientos" value={form.tratamientos} onChange={handleChange} />
                        <TextArea name="observaciones" icon={<FaInfoCircle />} placeholder="Observaciones" value={form.observaciones} onChange={handleChange} />
                    </section>

                    {/* Estado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                        <select
                            name="status"
                            value={form.status || ""}
                            onChange={handleChange}
                            className="text-black border border-blue-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Selecciona un estado</option>
                            <option value="Disponible">Disponible</option>
                            <option value="Adoptado">Adoptado</option>
                            <option value="En espera">En espera</option>
                        </select>
                    </div>

                    {/* Feedback */}
                    {error && <p className="text-red-600 text-center">{error}</p>}
                    {success && <p className="text-green-600 flex items-center gap-2 justify-center"><FaCheckCircle /> {success}</p>}

                    {/* Guardar */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl mt-6 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            Guardar cambios
                        </button>
                    </div>
                </form>

            </div>
        </div>

    );
}

// COMPONENTES AUXILIARES
function Input({ name, icon, ...props }) {
    return (
        <div className="relative w-full">
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <input
                name={name}
                {...props}
                className="text-black border border-blue-200 rounded-lg px-9 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
        </div>
    );
}

function TextArea({ name, icon, ...props }) {
    return (
        <div className="relative w-full mt-3">
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <textarea
                name={name}
                {...props}
                className="text-black border border-blue-200 rounded-lg px-9 py-2 w-full min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
        </div>
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
