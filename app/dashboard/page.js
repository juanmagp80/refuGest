"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation"; // Cambiar a 'next/navigation'
import { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function DashboardPage() {
    const [refugio, setRefugio] = useState(null);
    const [voluntario, setVoluntario] = useState(null);
    const [animales, setAnimales] = useState([]);
    const [tareas, setTareas] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [error, setError] = useState(null);  // Estado para manejar errores

    const router = useRouter();  // Usa useRouter de 'next/navigation' para el enrutamiento

    useEffect(() => {
        // Cargar refugio y voluntario
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) {
                router.push("/login");  // Redirige al login si no hay usuario
            } else {
                // Obtener refugio del usuario
                const { data: refugioData, error: refugioError } = await supabase
                    .from("refugios")
                    .select("id, name")
                    .eq("user_id", user.id)
                    .single();  // Usar .single() para obtener solo un registro

                if (refugioError) {
                    console.error("Error al obtener refugio:", refugioError);
                    setError("No se encontró el refugio para este usuario.");
                    return;
                }

                if (!refugioData) {
                    setError("No se encontró un refugio asociado con este usuario.");
                    return;
                }

                setRefugio(refugioData);

                // Obtener voluntario del usuario
                const { data: voluntarioData, error: voluntarioError } = await supabase
                    .from("voluntarios")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (voluntarioError) {
                    console.error("Error al obtener voluntario:", voluntarioError);
                    setError("No se encontró el voluntario para este usuario.");
                    return;
                }

                setVoluntario(voluntarioData);

                // Si el voluntario tiene un refugio asignado, obtener los animales
                if (voluntarioData?.refugio_id) {
                    const { data: animalesData, error: animalesError } = await supabase
                        .from("animales")
                        .select("*")
                        .eq("refugio_id", voluntarioData.refugio_id)  // Aseguramos que el `refugio_id` sea el correcto
                        .order("created_at", { ascending: true });

                    if (animalesError) {
                        console.error("Error al cargar animales:", animalesError);
                        setError("No se pudieron cargar los animales del refugio.");
                        return;
                    }

                    setAnimales(animalesData); // Aquí actualizamos el estado de los animales
                } else {
                    setError("El voluntario no tiene un refugio asignado.");
                }
            }
        });
    }, []);  // Este useEffect solo se ejecuta una vez cuando el componente se monta

    useEffect(() => {
        if (voluntario) {
            // Cargar las tareas y historial del voluntario
            const loadTasksAndHistory = async () => {
                const { data: tareasData, error: tareasError } = await supabase
                    .from("tareas_voluntarios")
                    .select("*")
                    .eq("volunteer_id", voluntario.id);

                if (tareasError) {
                    console.error("Error al cargar tareas:", tareasError);
                    setError("No se pudieron cargar las tareas del voluntario.");
                    return;
                }
                setTareas(tareasData);

                const { data: historialData, error: historialError } = await supabase
                    .from("actividades_voluntarios")
                    .select("*")
                    .eq("volunteer_id", voluntario.id);

                if (historialError) {
                    console.error("Error al cargar historial:", historialError);
                    setError("No se pudieron cargar el historial del voluntario.");
                    return;
                }
                setHistorial(historialData);
            };

            loadTasksAndHistory();
        }
    }, [voluntario]);  // Este useEffect depende de la carga del voluntario

    const handleLogout = async () => {
        // Cerrar sesión con Supabase
        await supabase.auth.signOut();

        // Redirigir a la página de login
        router.push("/login");  // Utiliza 'router.push' de 'next/navigation'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 via-blue-200 to-purple-100 p-10">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-green-700 mb-4">¡Hola, {voluntario?.nombre}!</h1>
                {error && <p className="text-red-600">{error}</p>}  {/* Mostrar errores si ocurren */}
                <p className="text-lg text-gray-800 mb-6">Este es tu panel de voluntario. Aquí podrás:</p>
                <ul className="list-disc ml-6 text-gray-700 space-y-2">
                    <li>🧹 Ver tareas asignadas</li>
                    <li>🐾 Ver los animales del refugio</li>
                    <li>📸 Subir fotos y ayudar en historias de éxito</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Tus Tareas Asignadas</h2>
                <div className="space-y-4">
                    {tareas.length === 0 ? (
                        <p className="text-gray-700">No tienes tareas asignadas por el momento.</p>
                    ) : (
                        tareas.map((tarea) => (
                            <div key={tarea.id} className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-gray-800">{tarea.task_name}</h3>
                                <p className="text-gray-700">{tarea.description}</p>
                                <p className="text-gray-500 text-sm">Asignada el {new Date(tarea.assigned_at).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Historial de Actividades</h2>
                <div className="space-y-4">
                    {historial.length === 0 ? (
                        <p className="text-gray-700">No has completado ninguna tarea aún.</p>
                    ) : (
                        historial.map((actividad) => (
                            <div key={actividad.id} className="bg-white p-4 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-gray-800">{actividad.task_name}</h3>
                                <p className="text-gray-700">{actividad.description}</p>
                                <p className="text-gray-500 text-sm">Completada el {new Date(actividad.completed_at).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Animales en el Refugio</h2>
                <div className="space-y-4">
                    {animales.length === 0 ? (
                        <p className="text-gray-700">No hay animales disponibles en este refugio.</p>
                    ) : (
                        animales.map((animal) => (
                            <div key={animal.id} className="bg-gray-100 p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold">{animal.name}</h3>
                                <p><strong>Especie:</strong> {animal.species}</p>
                                <p><strong>Raza:</strong> {animal.breed}</p>
                                <p><strong>Estado:</strong> {animal.status}</p>
                                <p><strong>Edad:</strong> {animal.age} años</p>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={handleLogout}  // Llamada a la función handleLogout
                    className="mt-8 flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>
    );
}
