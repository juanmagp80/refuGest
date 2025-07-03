"use client";

import SidebarFichaNuevo from "@/components/SidebarFichaNuevo";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
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

export default function NuevoAnimalPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        species: "",
        breed: "",
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
        imagen: "",
        status: "",
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [cloudinaryReady, setCloudinaryReady] = useState(false);

    useEffect(() => {
        if (window.cloudinary?.createUploadWidget || window.cloudinary?.openUploadWidget) {
            setCloudinaryReady(true);
        } else {
            const checkCloudinary = setInterval(() => {
                if (window.cloudinary?.createUploadWidget || window.cloudinary?.openUploadWidget) {
                    setCloudinaryReady(true);
                    clearInterval(checkCloudinary);
                }
            }, 300);
            return () => clearInterval(checkCloudinary);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Debes iniciar sesión para registrar un animal.");
            return;
        }

        const { data: refugio } = await supabase
            .from("refugios")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!refugio) {
            setError("No se ha encontrado el refugio.");
            return;
        }

        const { error: insertError } = await supabase.from("animales").insert([{
            ...form,
            refugio_id: refugio.id,
        }]);

        if (insertError) {
            setError(insertError.message);
        } else {
            setSuccess("Animal registrado correctamente.");
            setTimeout(() => router.push("/dashboard/animales"), 1500);
        }
    };

    const openCloudinaryWidget = () => {
        if (!window.cloudinary) {
            setError("El widget aún se está cargando. Intenta de nuevo en unos segundos.");
            return;
        }
        window.cloudinary.openUploadWidget(
            {
                cloudName: "dmx84o0ye",
                uploadPreset: "animales",
                sources: ["local", "url", "camera"],
                multiple: false,
                cropping: false,
                defaultSource: "local",
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setForm((prev) => ({ ...prev, imagen: result.info.secure_url }));
                }
            }
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100 p-4 flex flex-col md:flex-row gap-4 animate-fade-in">
            <SidebarFichaNuevo />

            <div className="flex-1">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 w-full max-w-4xl mx-auto flex flex-col gap-6 border-2 border-blue-200 animate-slide-up"
                >
                    <div className="flex flex-col items-center mb-4">
                        <div className="flex items-center gap-2 text-4xl text-blue-600 drop-shadow-lg">
                            <FaDog />
                            <FaCat />
                        </div>
                        <h1 className="text-3xl font-extrabold mt-2 text-blue-700 tracking-tight text-center">
                            Registrar nuevo animal
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 text-center">
                            Completa todos los campos para añadir un nuevo amigo al refugio
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input name="name" icon={<FaIdBadge />} placeholder="Nombre" value={form.name} onChange={handleChange} required />
                        <Input name="species" icon={<FaDog />} placeholder="Especie" value={form.species} onChange={handleChange} required />
                        <Input name="breed" icon={<FaInfoCircle />} placeholder="Raza" value={form.breed} onChange={handleChange} />
                        <Input name="edad" icon={<FaCalendarAlt />} placeholder="Edad" value={form.edad} onChange={handleChange} />
                        <Input name="sexo" icon={<FaVenusMars />} placeholder="Sexo" value={form.sexo} onChange={handleChange} />
                        <Input name="chip" icon={<FaIdBadge />} placeholder="Nº Chip" value={form.chip} onChange={handleChange} />
                        <Input name="ultima_visita" icon={<FaCalendarAlt />} type="date" value={form.ultima_visita} onChange={handleChange} />
                        <Input name="veterinario" icon={<FaUserMd />} placeholder="Veterinario" value={form.veterinario} onChange={handleChange} />
                    </div>

                    <label className="flex items-center gap-2 text-black font-medium">
                        <input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={handleChange} className="accent-blue-600 scale-125" />
                        Esterilizado
                    </label>

                    <select
                        name="status"
                        value={form.status || ""}
                        onChange={handleChange}
                        className="text-black border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full"
                        required
                    >
                        <option value="" disabled>Selecciona el estado del animal</option>
                        <option value="Disponible">Disponible</option>
                        <option value="Adoptado">Adoptado</option>
                        <option value="En espera">En espera</option>
                    </select>

                    <button
                        type="button"
                        onClick={openCloudinaryWidget}
                        disabled={!cloudinaryReady}
                        className={`${cloudinaryReady
                            ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
                            : "bg-gray-300 cursor-not-allowed"
                            } text-white px-4 py-2 rounded font-bold shadow transition duration-200`}
                    >
                        {cloudinaryReady ? "Subir imagen" : "Cargando widget..."}
                    </button>

                    {form.imagen && (
                        <div className="flex justify-center">
                            <img src={form.imagen} alt="Imagen subida" className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-blue-300 shadow-lg mt-2" />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <TextArea name="descripcion" icon={<FaInfoCircle />} placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
                        <TextArea name="vacunas" icon={<FaSyringe />} placeholder="Vacunas (separadas por coma)" value={form.vacunas} onChange={handleChange} />
                        <TextArea name="enfermedades" icon={<FaNotesMedical />} placeholder="Enfermedades" value={form.enfermedades} onChange={handleChange} />
                        <TextArea name="tratamientos" icon={<FaNotesMedical />} placeholder="Tratamientos" value={form.tratamientos} onChange={handleChange} />
                        <TextArea name="observaciones" icon={<FaInfoCircle />} placeholder="Observaciones" value={form.observaciones} onChange={handleChange} className="sm:col-span-2" />
                    </div>

                    {error && <p className="text-red-600 flex items-center gap-2"><FaNotesMedical /> {error}</p>}
                    {success && <p className="text-green-600 flex items-center gap-2"><FaCheckCircle /> {success}</p>}

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl mt-4 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Guardar animal
                    </button>
                </form>
            </div>

            {/* Animaciones */}
            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 1s ease; }

        @keyframes slide-up {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.4, 2, 0.6, 1) 0.1s both;
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

function TextArea({ name, icon, className = "", ...props }) {
    return (
        <div className={`relative ${className}`}>
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <textarea
                name={name}
                {...props}
                className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-h-[60px] w-full"
            />
        </div>
    );
}
