import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function GestionSolicitudesAdopcion({ refugioId }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formularioSeleccionado, setFormularioSeleccionado] = useState(null);

    useEffect(() => {
        const fetchSolicitudes = async () => {
            setLoading(true);
            // 1. Trae todas las solicitudes con animal y adoptante
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
                    adoptante:adoptante_id(name, email)
                `)
                .order("created_at", { ascending: false });

            if (error) {
                setSolicitudes([]);
                setLoading(false);
                return;
            }

            // 2. Filtra por animales del refugio actual
            const solicitudesFiltradas = (solicitudesRaw || []).filter(
                s => s.animal?.refugio_id === refugioId
            );

            // 3. Para cada solicitud, busca la adopción y el formulario
            const solicitudesConFormulario = await Promise.all(
                solicitudesFiltradas.map(async (s) => {
                    // Busca la adopción correspondiente
                    const { data: adopcion } = await supabase
                        .from("adopciones")
                        .select("id")
                        .eq("adoptante_id", s.adoptante_id)
                        .eq("animal_id", s.animal_id)
                        .maybeSingle();

                    let formulario = null;
                    if (adopcion) {
                        // Busca el formulario de esa adopción
                        const { data: formularios } = await supabase
                            .from("formularios_adopcion")
                            .select("id, motivo, experiencia, vivienda, tiempodisponible, gastosveterinario")
                            .eq("adopcion_id", adopcion.id)
                            .limit(1)
                            .maybeSingle();
                        formulario = formularios || null;
                    }
                    return { ...s, formulario };
                })
            );

            setSolicitudes(solicitudesConFormulario);
            setLoading(false);
        };
        fetchSolicitudes();
    }, [refugioId]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Solicitudes de adopción</h2>
            {loading ? (
                <p>Cargando solicitudes...</p>
            ) : solicitudes.length === 0 ? (
                <p className="italic text-gray-500">No hay solicitudes aún.</p>
            ) : (
                <ul className="space-y-6">
                    {solicitudes.map((s) => (
                        <li key={s.id} className="bg-white p-4 rounded-xl shadow flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <img
                                    src={s.animal.imagen}
                                    alt={s.animal.name}
                                    className="w-16 h-16 rounded object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-lg">{s.animal.name} ({s.animal.species})</h4>
                                    <p className="text-sm text-gray-600">
                                        Solicitante: {s.adoptante?.name || "Desconocido"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Solicitada el {new Date(s.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm">
                                        Estado: <span className="font-semibold">{s.status}</span>
                                    </p>
                                </div>
                            </div>
                            {s.formulario ? (
                                <button
                                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
                                    onClick={() => setFormularioSeleccionado(s.formulario)}
                                >
                                    Ver formulario enviado
                                </button>
                            ) : (
                                <span className="mt-2 text-gray-500 italic text-sm">
                                    Formulario no enviado aún.
                                </span>
                            )}
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

function ModalFormulario({ formulario, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                    onClick={onClose}
                >
                    ×
                </button>
                <h3 className="text-xl font-bold mb-4">Formulario de adopción</h3>
                <div className="space-y-2">
                    <p><b>Motivo:</b> {formulario.motivo}</p>
                    <p><b>Experiencia:</b> {formulario.experiencia}</p>
                    <p><b>Vivienda:</b> {formulario.vivienda}</p>
                    <p><b>Tiempo disponible:</b> {formulario.tiempodisponible}</p>
                    <p><b>Gastos veterinario:</b> {formulario.gastosveterinario}</p>
                </div>
            </div>
        </div>
    );
}