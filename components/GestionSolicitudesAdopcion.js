import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function GestionSolicitudesAdopcion({ refugioId }) {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1) Carga inicial de solicitudes
    const fetchSolicitudes = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: animalesData, error: animalesError } = await supabase
                .from("animales")
                .select("id")
                .eq("refugio_id", refugioId);
            if (animalesError) throw animalesError;

            const animalIds = animalesData.map((a) => a.id);
            if (!animalIds.length) {
                setSolicitudes([]);
                return;
            }

            const { data, error } = await supabase
                .from("solicitudes_adopcion")
                .select(`
                    id,
                    status,
                    adoptante_id,
                    animal_id,
                    adoptante:adoptante_id(id, name, contact_info),
                    animal:animal_id(id, name, status)
                `)
                .in("animal_id", animalIds)
                .eq("status", "pendiente");  // Solo pendientes

            if (error) throw error;
            setSolicitudes(data);

            // LOG de solicitudes cargadas
            console.log("Solicitudes pendientes cargadas:", data);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, [refugioId]);

    // 2) Aceptar solicitud: upsert adoptante, crear adopción y actualizar estado
    const aceptarSolicitud = async (sol) => {
        setError(null);
        try {
            // 2.1) Upsert adoptante
            const { data: adoptanteUpsert, error: errAdoptante } = await supabase
                .from("adoptantes")
                .upsert(
                    {
                        id: sol.adoptante_id,
                        name: sol.adoptante.name,
                        contact_info: sol.adoptante.contact_info,
                    },
                    { onConflict: "id" }
                )
                .select("id")
                .single();
            if (errAdoptante) throw errAdoptante;

            // LOG adoptante upsert
            console.log("Adoptante upsert:", adoptanteUpsert);

            // 2.2) Crear adopción y esperar a que termine
            const { data: adopcionInsertada, error: errorInsert } = await supabase
                .from("adopciones")
                .insert(
                    [
                        {
                            adoptante_id: adoptanteUpsert.id,
                            animal_id: sol.animal_id,
                            formulario_iniciado: true,
                        },
                    ],
                    { returning: "representation" }
                )
                .select("*")
                .single();
            if (errorInsert) throw errorInsert;

            // LOG adopción insertada
            console.log("Adopción insertada:", adopcionInsertada);

            // Confirmar que la adopción existe antes de continuar (por latencia)
            let intentos = 0;
            let adopcionConfirmada = null;
            while (intentos < 5 && !adopcionConfirmada) {
                const { data: confirm, error: confirmError } = await supabase
                    .from("adopciones")
                    .select("id, adoptante_id, animal_id, formulario_iniciado")
                    .eq("id", adopcionInsertada.id)
                    .single();
                if (confirm && confirm.id) {
                    adopcionConfirmada = confirm;
                } else {
                    await new Promise(res => setTimeout(res, 300));
                    intentos++;
                }
            }
            // LOG adopción confirmada
            console.log("Adopción confirmada:", adopcionConfirmada);

            if (!adopcionConfirmada) {
                throw new Error("No se pudo confirmar la creación de la adopción. Intenta de nuevo.");
            }

            // 2.3) Actualizar estado del animal y solicitud
            // Cambia aquí el valor de status a uno permitido por tu base de datos, por ejemplo "reservado"
            const { error: errorAnimal } = await supabase.from("animales").update({ status: "reservado" }).eq("id", sol.animal_id);
            if (errorAnimal) throw errorAnimal;
            const { error: errorSolicitud } = await supabase.from("solicitudes_adopcion").update({ status: "aceptada" }).eq("id", sol.id);
            if (errorSolicitud) throw errorSolicitud;

            // LOG actualización de animal y solicitud
            console.log("Animal actualizado a 'reservado' y solicitud a 'aceptada'");

            // Refrescar solicitudes
            fetchSolicitudes();

        } catch (err) {
            setError(err.message);
            console.error("Error al aceptar solicitud:", err);
        }
    };

    // Renderizado
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Solicitudes de adopción</h1>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            {loading ? (
                <p>Cargando...</p>
            ) : solicitudes.length === 0 ? (
                <p>No hay solicitudes pendientes.</p>
            ) : (
                <ul className="space-y-4">
                    {solicitudes.map((sol) => (
                        <li key={sol.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <p><strong>Animal:</strong> {sol.animal?.name}</p>
                                <p><strong>Adoptante:</strong> {sol.adoptante?.name}</p>
                                <p><strong>Contacto:</strong> {sol.adoptante?.contact_info}</p>
                            </div>
                            <button
                                className="mt-2 md:mt-0 bg-green-600 text-white px-4 py-2 rounded"
                                onClick={() => {
                                    console.log("Aceptar solicitud:", sol);
                                    aceptarSolicitud(sol);
                                }}
                            >
                                Aceptar solicitud
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}