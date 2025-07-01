"use client";

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
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: refugio, error: refugioError } = await supabase
                .from("refugios")
                .select("id, name")
                .eq("user_id", user.id)
                .single();

            if (refugioError || !refugio) {
                setError("Refugio no encontrado.");
                return;
            }

            setRefugioId(refugio.id);
            setRefugio(refugio);

            const { data: animalesData, error: animalesError } = await supabase
                .from("animales")
                .select("*")
                .eq("refugio_id", refugio.id)
                .order("created_at", { ascending: false });

            if (animalesError) {
                setError(animalesError.message);
            } else {
                setAnimales(animalesData);
            }
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
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {animales.map((animal) => (
                    <div key={animal.id} className="bg-white rounded-xl shadow-lg border border-blue-100 p-4">
                        {animal.imagen && (
                            <img src={animal.imagen} alt={animal.name} className="w-full h-48 object-cover rounded mb-3" />
                        )}
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold text-blue-600">{animal.name}</h2>
                            <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full
                    ${animal.status === "Disponible" ? "bg-green-200 text-green-800" : ""}
                    ${animal.status === "En espera" ? "bg-yellow-200 text-yellow-800" : ""}
                    ${animal.status === "Adoptado" ? "bg-gray-300 text-gray-800" : ""}
                `}
                            >
                                {animal.status}
                            </span>
                        </div>
                        <p className="text-gray-600">{animal.species} - {animal.breed}</p>
                        <p className="text-sm text-gray-500 mt-1">{animal.descripcion}</p>
                        <div className="flex justify-between mt-4 text-sm">
                            <Link href={`/dashboard/animales/${animal.id}`} className="text-yellow-600 hover:underline flex items-center gap-1">
                                <FaEdit /> Editar
                            </Link>
                            <button onClick={() => handleDelete(animal.id)} className="text-red-600 hover:underline flex items-center gap-1">
                                <FaTrash /> Borrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {animales.length === 0 && !error && (
                <p className="text-center text-gray-500 mt-6">No hay animales registrados todavía.</p>
            )}
        </div>
    );
}