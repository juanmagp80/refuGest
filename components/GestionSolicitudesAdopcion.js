import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function GestionSolicitudesAdopcion({ refugioId }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formularioSeleccionado, setFormularioSeleccionado] = useState(null);
    const [accionando, setAccionando] = useState(null); // id de solicitud en acción

    useEffect(() => {
        const fetchSolicitudes = async () => {
            setLoading(true);

            const { data: solicitudesRaw, error } = await supabase
                .from("solicitudes_adopcion")
                .select(`
                    id,
                    status,
                    created_at,
                    adoptante_id,
                    animal_id,
                    animal:animal_id(
                        name, species, imagen, refugio_id
                    ),
                    adoptante:adoptante_id(name)
                `)
                .order("created_at", { ascending: false });

            if (error || !solicitudesRaw) {
                setSolicitudes([]);
                setLoading(false);
                return;
            }

            const solicitudesFiltradas = solicitudesRaw.filter(
                s => s.animal?.refugio_id === refugioId
            );

            const solicitudesConFormulario = await Promise.allSettled(
                solicitudesFiltradas.map(async (s) => {
                    const { data: adopcion } = await supabase
                        .from("adopciones")
                        .select("id")
                        .eq("adoptante_id", s.adoptante_id)
                        .eq("animal_id", s.animal_id)
                        .maybeSingle();

                    let formulario = null;
                    if (adopcion) {
                        const { data: form } = await supabase
                            .from("formularios_adopcion")
                            .select("id, motivo, experiencia, vivienda, tiempodisponible, gastosveterinario")
                            .eq("adopcion_id", adopcion.id)
                            .maybeSingle();
                        formulario = form || null;
                    }
                    return { ...s, formulario };
                })
            );

            setSolicitudes(
                solicitudesConFormulario
                    .filter(r => r.status === "fulfilled")
                    .map(r => r.value)
            );
            setLoading(false);
        };

        fetchSolicitudes();
    }, [refugioId]);

    // Función para aceptar o rechazar
    const actualizarEstado = async (id, nuevoEstado) => {
        setAccionando(id);
        const { error } = await supabase
            .from("solicitudes_adopcion")
            .update({ status: nuevoEstado })
            .eq("id", id);

        if (!error) {
            setSolicitudes(solicitudes =>
                solicitudes.map(s =>
                    s.id === id ? { ...s, status: nuevoEstado } : s
                )
            );
        }
        setAccionando(null);
    };

    return (
        <div>
            <h2 className="text-3xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-red-400 drop-shadow-lg">
                Solicitudes de adopción
            </h2>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
                </div>
            ) : solicitudes.length === 0 ? (
                <p className="italic text-gray-500 text-center text-lg">No hay solicitudes aún.</p>
            ) : (
                <ul className="space-y-8">
                    {solicitudes.map((s) => (
                        <li
                            key={s.id}
                            className="bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-6 rounded-3xl shadow-2xl flex flex-col gap-4 border-2 border-purple-200 hover:scale-[1.01] transition-transform"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <img
                                        src={s.animal.imagen}
                                        alt={s.animal.name}
                                        className="w-28 h-28 rounded-full object-cover border-4 border-pink-400 shadow-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-extrabold text-2xl text-purple-700 mb-1 flex items-center gap-2">
                                        {s.animal.name}
                                        <span className="text-base font-semibold text-pink-600">({s.animal.species})</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow
                                            ${s.status === "aceptada" ? "bg-green-200 text-green-800" :
                                                s.status === "rechazada" ? "bg-red-200 text-red-800" :
                                                    "bg-purple-200 text-purple-800"}`}>
                                            Estado: {s.status}
                                        </span>
                                        <span className="bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-xs font-bold shadow">
                                            Solicitante: {s.adoptante?.name || "Desconocido"}
                                        </span>
                                        <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold shadow">
                                            {new Date(s.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {s.formulario ? (
                                        <button
                                            className="mt-2 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 hover:from-purple-700 hover:to-yellow-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transition"
                                            onClick={() => setFormularioSeleccionado(s.formulario)}
                                        >
                                            Ver formulario enviado
                                        </button>
                                    ) : (
                                        <span className="mt-2 text-gray-500 italic text-sm">
                                            Formulario no enviado aún.
                                        </span>
                                    )}

                                    {/* Botones aceptar/rechazar solo si está pendiente */}
                                    {s.status === "pendiente" && (
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow transition"
                                                disabled={accionando === s.id}
                                                onClick={() => actualizarEstado(s.id, "aceptada")}
                                            >
                                                {accionando === s.id ? "Procesando..." : "Aceptar"}
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow transition"
                                                disabled={accionando === s.id}
                                                onClick={() => actualizarEstado(s.id, "rechazada")}
                                            >
                                                {accionando === s.id ? "Procesando..." : "Rechazar"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal para mostrar el formulario */}
            {formularioSeleccionado && (
                <ModalFormulario
                    formulario={formularioSeleccionado}
                    onClose={() => setFormularioSeleccionado(null)}
                />
            )}
        </div>
    );
}

// ...ModalFormulario igual que antes...