"use client";

import Animales from "@/components/Animales";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaCalendarAlt,
    FaCamera,
    FaDog,
    FaHandsHelping, FaHome,
    FaIdBadge,
    FaInfoCircle,
    FaNotesMedical,
    FaPaw, FaPlus, FaSignOutAlt,
    FaSyringe,
    FaUserCircle,
    FaUserMd,
    FaUsers,
    FaVenusMars
} from "react-icons/fa";

export default function DashboardPage() {
    const router = useRouter();
    const [refugio, setRefugio] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [animalForm, setAnimalForm] = useState({
        name: "",
        species: "",
        breed: "",
        edad: "",
        sexo: "",
        chip: "",
        esterilizado: false,
        vacunas: "",
        enfermedades: "",
        tratamientos: "",
        ultima_visita: "",
        veterinario: "",
        observaciones: "",
        imagen: "",
        descripcion: "",
    });
    const [animalError, setAnimalError] = useState(null);
    const [animalSuccess, setAnimalSuccess] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                router.push("/login");
            } else {
                const { data: refugioData } = await supabase
                    .from("refugios")
                    .select("id, name, location, contact_info, description")
                    .eq("user_id", user.id)
                    .single();
                setRefugio(refugioData);
            }
        });
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleAnimalChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAnimalForm({ ...animalForm, [name]: type === "checkbox" ? checked : value });
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
                    setAnimalForm({ ...animalForm, imagen: result.info.secure_url });
                }
            }
        );
    };

    const handleAnimalSubmit = async (e) => {
        e.preventDefault();
        setAnimalError(null);
        setAnimalSuccess(null);

        if (!refugio) {
            setAnimalError("No se ha encontrado el refugio.");
            return;
        }

        const { error } = await supabase
            .from("animales")
            .insert([
                {
                    ...animalForm,
                    refugio_id: refugio.id,
                },
            ]);

        if (error) {
            setAnimalError(error.message);
        } else {
            setAnimalSuccess("¡Animal añadido correctamente!");
            setAnimalForm({
                name: "",
                species: "",
                breed: "",
                edad: "",
                sexo: "",
                chip: "",
                esterilizado: false,
                vacunas: "",
                enfermedades: "",
                tratamientos: "",
                ultima_visita: "",
                veterinario: "",
                observaciones: "",
                imagen: "",
                descripcion: "",
            });
            setShowModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-100">
            {/* Menú espectacular */}
            <nav className="w-full bg-white/80 shadow-2xl py-4 px-10 flex items-center justify-between fixed top-0 left-0 z-20 backdrop-blur-lg border-b-2 border-blue-200 animate-slide-down">
                <div className="flex items-center gap-4">
                    <FaHome className="text-blue-600 text-3xl drop-shadow" />
                    <span className="text-2xl font-extrabold text-blue-700 tracking-wide drop-shadow-lg">RefuGest</span>
                    {refugio && (
                        <span className="ml-6 px-5 py-1 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-black font-bold shadow text-lg border-2 border-yellow-200 animate-pulse">
                            {refugio.name}
                        </span>
                    )}
                </div>
                <ul className="flex gap-8 items-center">
                    <li>
                        <Link href="/dashboard" className="flex items-center gap-2 text-blue-700 hover:text-pink-500 font-bold transition text-lg">
                            <FaHome /> Inicio
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/animales" className="flex items-center gap-2 text-purple-700 hover:text-pink-500 font-bold transition text-lg">
                            <FaPaw /> Animales
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/voluntarios" className="flex items-center gap-2 text-green-700 hover:text-pink-500 font-bold transition text-lg">
                            <FaHandsHelping /> Voluntarios
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/adoptantes" className="flex items-center gap-2 text-pink-700 hover:text-blue-500 font-bold transition text-lg">
                            <FaUsers /> Adoptantes
                        </Link>
                    </li>
                    <li>
                        <Link href="/dashboard/perfil" className="flex items-center gap-2 text-gray-700 hover:text-blue-500 font-bold transition text-lg">
                            <FaUserCircle /> Perfil
                        </Link>
                    </li>
                </ul>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </nav>

            {/* Espacio para el menú fijo */}
            <div className="h-24" />

            {/* Contenido principal */}
            <div className="flex flex-col items-center justify-center">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-10 mt-8 w-full max-w-2xl border-2 border-blue-200 animate-fade-in">
                    {refugio && (
                        <>
                            <h1 className="text-4xl font-extrabold mb-2 text-blue-700 drop-shadow-lg">{refugio.name}</h1>
                            <p className="mb-2 text-gray-900 text-lg">{refugio.description}</p>
                            <p className="mb-2 text-gray-800">
                                <span className="font-semibold">Ubicación:</span> {refugio.location}
                            </p>
                            <p className="mb-2 text-gray-800">
                                <span className="font-semibold">Contacto:</span> {refugio.contact_info}
                            </p>
                        </>
                    )}
                    <p className="mt-4 text-gray-900 text-lg">
                        ¡Bienvenido! Aquí podrás gestionar animales, voluntarios y adoptantes.
                    </p>
                    {/* Botón para añadir animal */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-8 flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <FaPlus /> Añadir animal
                    </button>
                    {animalSuccess && <p className="mt-4 text-green-600 font-bold">{animalSuccess}</p>}

                    {/* Listado de animales */}
                    {refugio && <Animales refugioId={refugio.id} />}
                </div>
            </div>

            {/* Modal para añadir animal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl border-2 border-blue-200 relative animate-fade-in">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-pink-600 hover:text-red-700 text-2xl font-bold"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaPlus /> Añadir animal</h2>
                        <form onSubmit={handleAnimalSubmit} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <FaIdBadge className="absolute left-3 top-3 text-blue-400" />
                                    <input name="name" placeholder="Nombre" value={animalForm.name} onChange={handleAnimalChange} required className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                                </div>
                                <div className="relative">
                                    <FaDog className="absolute left-3 top-3 text-purple-400" />
                                    <input name="species" placeholder="Especie" value={animalForm.species} onChange={handleAnimalChange} required className="text-black border-2 border-purple-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition" />
                                </div>
                                <div className="relative">
                                    <FaInfoCircle className="absolute left-3 top-3 text-pink-400" />
                                    <input name="breed" placeholder="Raza" value={animalForm.breed} onChange={handleAnimalChange} className="text-black border-2 border-pink-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 transition" />
                                </div>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-green-400" />
                                    <input name="edad" placeholder="Edad" value={animalForm.edad} onChange={handleAnimalChange} className="text-black border-2 border-green-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 transition" />
                                </div>
                                <div className="relative">
                                    <FaVenusMars className="absolute left-3 top-3 text-yellow-400" />
                                    <input name="sexo" placeholder="Sexo" value={animalForm.sexo} onChange={handleAnimalChange} className="text-black border-2 border-yellow-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition" />
                                </div>
                                <div className="relative">
                                    <FaIdBadge className="absolute left-3 top-3 text-blue-300" />
                                    <input name="chip" placeholder="Nº Chip" value={animalForm.chip} onChange={handleAnimalChange} className="text-black border-2 border-blue-100 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition" />
                                </div>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-purple-300" />
                                    <input name="ultima_visita" type="date" placeholder="Última visita veterinario" value={animalForm.ultima_visita} onChange={handleAnimalChange} className="border-2 border-purple-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-300 transition" />
                                </div>
                                <div className="relative">
                                    <FaUserMd className="absolute left-3 top-3 text-green-300" />
                                    <input name="veterinario" placeholder="Veterinario habitual" value={animalForm.veterinario} onChange={handleAnimalChange} className="text-black border-2 border-green-100 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 transition" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-black font-medium">
                                <input type="checkbox" name="esterilizado" checked={animalForm.esterilizado} onChange={handleAnimalChange} className="accent-blue-600 scale-125" />
                                Esterilizado
                            </label>
                            <button
                                type="button"
                                onClick={openCloudinaryWidget}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded font-bold shadow transition-all duration-200"
                            >
                                <FaCamera /> Subir imagen
                            </button>
                            {animalForm.imagen && (
                                <div className="flex justify-center">
                                    <img
                                        src={animalForm.imagen}
                                        alt="Imagen subida"
                                        className="w-32 h-32 object-cover rounded-full border-4 border-blue-300 shadow-lg mt-2"
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <FaInfoCircle className="absolute left-3 top-3 text-blue-300" />
                                    <textarea name="descripcion" placeholder="Descripción" value={animalForm.descripcion} onChange={handleAnimalChange} className="border-2 border-blue-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-300 transition min-h-[60px]" />
                                </div>
                                <div className="relative">
                                    <FaSyringe className="absolute left-3 top-3 text-green-300" />
                                    <textarea name="vacunas" placeholder="Vacunas (separadas por coma)" value={animalForm.vacunas} onChange={handleAnimalChange} className="border-2 border-green-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-300 transition min-h-[60px]" />
                                </div>
                                <div className="relative">
                                    <FaNotesMedical className="absolute left-3 top-3 text-red-300" />
                                    <textarea name="enfermedades" placeholder="Enfermedades" value={animalForm.enfermedades} onChange={handleAnimalChange} className="border-2 border-red-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-red-300 transition min-h-[60px]" />
                                </div>
                                <div className="relative">
                                    <FaNotesMedical className="absolute left-3 top-3 text-purple-300" />
                                    <textarea name="tratamientos" placeholder="Tratamientos" value={animalForm.tratamientos} onChange={handleAnimalChange} className="border-2 border-purple-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-purple-300 transition min-h-[60px]" />
                                </div>
                                <div className="relative md:col-span-2">
                                    <FaInfoCircle className="absolute left-3 top-3 text-yellow-300" />
                                    <textarea name="observaciones" placeholder="Observaciones" value={animalForm.observaciones} onChange={handleAnimalChange} className="border-2 border-yellow-100 rounded-lg px-9 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-300 transition min-h-[60px]" />
                                </div>
                            </div>
                            {animalError && <p className="text-red-600 font-bold">{animalError}</p>}
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease;
                }
                @keyframes slide-down {
                    from { transform: translateY(-40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-down {
                    animation: slide-down 0.8s cubic-bezier(.4,2,.6,1) 0.1s both;
                }
            `}</style>
        </div>
    );
}
