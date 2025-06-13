"use client";

import Animales from "@/components/Animales";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHandsHelping, FaHome, FaPaw, FaPlus, FaSignOutAlt, FaUserCircle, FaUsers } from "react-icons/fa";

export default function DashboardPage() {
    const router = useRouter();
    const [refugio, setRefugio] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [animalForm, setAnimalForm] = useState({
        nombre: "",
        especie: "",
        edad: "",
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
        setAnimalForm({ ...animalForm, [e.target.name]: e.target.value });
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
                    nombre: animalForm.nombre,
                    especie: animalForm.especie,
                    edad: animalForm.edad,
                    descripcion: animalForm.descripcion,
                    refugio_id: refugio.id,
                },
            ]);

        if (error) {
            setAnimalError(error.message);
        } else {
            setAnimalSuccess("¡Animal añadido correctamente!");
            setAnimalForm({ nombre: "", especie: "", edad: "", descripcion: "" });
            setShowModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
            {/* Menú espectacular */}
            <nav className="w-full bg-white/80 shadow-lg py-3 px-8 flex items-center justify-between fixed top-0 left-0 z-10 backdrop-blur">
                <div className="flex items-center gap-4">
                    <FaHome className="text-blue-600 text-2xl" />
                    <span className="text-xl font-bold text-gray-800 tracking-wide">RefuGest</span>
                    {refugio && (
                        <span className="ml-6 px-4 py-1 rounded-full bg-yellow-400 text-black font-bold shadow text-base">
                            {refugio.name}
                        </span>
                    )}
                </div>
                <ul className="flex gap-8 items-center">
                    <li>
                        <a href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
                            <FaHome /> Inicio
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/animales" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
                            <FaPaw /> Animales
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/voluntarios" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
                            <FaHandsHelping /> Voluntarios
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/adoptantes" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
                            <FaUsers /> Adoptantes
                        </a>
                    </li>
                    <li>
                        <a href="/dashboard/perfil" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition">
                            <FaUserCircle /> Perfil
                        </a>
                    </li>
                </ul>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </nav>

            {/* Espacio para el menú fijo */}
            <div className="h-20" />

            {/* Contenido principal */}
            <div className="flex flex-col items-center justify-center">
                <div className="bg-white/90 rounded-xl shadow-xl p-8 mt-8 w-full max-w-xl">
                    {refugio && (
                        <>
                            <h1 className="text-3xl font-extrabold mb-2 text-black">{refugio.name}</h1>
                            <p className="mb-2 text-gray-900">{refugio.description}</p>
                            <p className="mb-2 text-gray-800">
                                <span className="font-semibold">Ubicación:</span> {refugio.location}
                            </p>
                            <p className="mb-2 text-gray-800">
                                <span className="font-semibold">Contacto:</span> {refugio.contact_info}
                            </p>
                        </>
                    )}
                    <p className="mt-4 text-gray-900">
                        ¡Bienvenido! Aquí podrás gestionar animales, voluntarios y adoptantes.
                    </p>
                    {/* Botón para añadir animal */}
                    <Link
                        href="/dashboard/animales/nuevo"
                        className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
                    >
                        <FaPlus /> Añadir animal
                    </Link>
                    {animalSuccess && <p className="mt-4 text-green-600">{animalSuccess}</p>}

                    {/* Listado de animales */}
                    {refugio && <Animales refugioId={refugio.id} />}
                </div>
            </div>

            {/* Modal para añadir animal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                        <Link
                            href="/dashboard/animales/nuevo"
                            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded shadow transition"
                        >
                            <FaPlus /> Añadir animal
                        </Link>
                        <h2 className="text-2xl font-bold mb-4 text-blue-700">Añadir animal</h2>
                        <form onSubmit={handleAnimalSubmit} className="flex flex-col gap-3">
                            <input
                                name="nombre"
                                placeholder="Nombre"
                                value={animalForm.nombre}
                                onChange={handleAnimalChange}
                                required
                                className="border rounded px-3 py-2"
                            />
                            <input
                                name="especie"
                                placeholder="Especie"
                                value={animalForm.especie}
                                onChange={handleAnimalChange}
                                required
                                className="border rounded px-3 py-2"
                            />
                            <input
                                name="edad"
                                placeholder="Edad"
                                value={animalForm.edad}
                                onChange={handleAnimalChange}
                                required
                                className="border rounded px-3 py-2"
                            />
                            <textarea
                                name="descripcion"
                                placeholder="Descripción"
                                value={animalForm.descripcion}
                                onChange={handleAnimalChange}
                                required
                                className="border rounded px-3 py-2"
                            />
                            {animalError && <p className="text-red-600">{animalError}</p>}
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2"
                            >
                                Guardar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}