"use client";

import Sidebar from "@/components/Sidebar"; // Asegúrate que esta ruta es correcta
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEdit, FaPaw, FaPlus, FaTrash } from "react-icons/fa";

export default function ListaAnimalesPage() {
    const [animales, setAnimales] = useState([]);
    const [refugioId, setRefugioId] = useState(null);
    const [refugio, setRefugio] = useState(null);
    const [error, setError] = useState(null);
    const [adoptante, setAdoptante] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: refugioData } = await supabase
                .from("refugios")
                .select("id, name")
                .eq("user_id", user.id)
                .single();

            if (refugioData) {
                setRefugioId(refugioData.id);
                setRefugio(refugioData);

                const { data: animalesData, error: animalesError } = await supabase
                    .from("animales")
                    .select("*")
                    .eq("refugio_id", refugioData.id)
                    .order("created_at", { ascending: false });

                if (animalesError) {
                    setError(animalesError.message);
                } else {
                    setAnimales(animalesData);
                }

                return;
            }

            const { data: adoptanteData } = await supabase
                .from("adoptantes")
                .select("name")
                .eq("user_id", user.id)
                .single();

            if (adoptanteData) {
                setAdoptante(adoptanteData);

                const { data: animalesDisponibles, error: animalesError } = await supabase
                    .from("animales")
                    .select("*")
                    .eq("status", "Disponible")
                    .order("created_at", { ascending: false });

                if (animalesError) {
                    setError(animalesError.message);
                } else {
                    setAnimales(animalesDisponibles);
                }

                return;
            }

            setError("No tienes permisos para ver esta página.");
        };

        fetchData();
    }, [router]);

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de que quieres borrar este animal?")) {
            const { error } = await supabase.from("animales").delete().eq("id", id);
            if (error) {
                alert("Error al borrar: " + error.message);
            } else {
                setAnimales(animales.filter((animal) => animal.id !== id));
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 ml-64 p-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold text-blue-500 flex items-center gap-2">
                        <FaPaw /> Animales del refugio: {refugio?.name || ""}
                    </h1>
                    <Link
                        href="/dashboard/animales/nuevo"
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold shadow"
                    >
                        <FaPlus /> Nuevo
                    </Link>
                </div>

                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 mb-6 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow transition"
                >
                    ⬅ Volver al dashboard
                </Link>

                {error && <p className="text-red-600">{error}</p>}

                {animales.length === 0 && !error ? (
                    <p className="text-center text-gray-500 mt-6">No hay animales registrados todavía.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 text-gray-700 text-sm font-semibold">
                                <tr>
                                    <th className="px-4 py-3 text-left">FOTO</th>
                                    <th className="px-4 py-3 text-left">NOMBRE</th>
                                    <th className="px-4 py-3 text-left">TIPO</th>
                                    <th className="px-4 py-3 text-left">SEXO</th>
                                    <th className="px-4 py-3 text-left">ESTADO</th>
                                    <th className="px-4 py-3 text-center">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {animales.map((animal) => (
                                    <tr key={animal.id} className="border-t border-gray-200 hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <img
                                                src={animal.imagen || "/images/default-animal.jpg"}
                                                alt={animal.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-semibold">{animal.name}</td>
                                        <td className="px-4 py-3">{animal.species}</td>
                                        <td className="px-4 py-3">{animal.sexo}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full 
                                                ${animal.status === "Disponible" ? "bg-green-100 text-green-800" : ""}
                                                ${animal.status === "En espera" ? "bg-yellow-100 text-yellow-800" : ""}
                                                ${animal.status === "Adoptado" ? "bg-purple-100 text-purple-800" : ""}
                                            `}>
                                                {animal.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {refugio && (
                                                <div className="flex justify-center gap-4 text-lg">
                                                    <Link href={`/dashboard/animales/${animal.id}`} className="text-yellow-600 hover:text-yellow-800">
                                                        <FaEdit />
                                                    </Link>
                                                    <button onClick={() => handleDelete(animal.id)} className="text-red-600 hover:text-red-800">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
