"use client";

import AnimalesParaAdoptar from "@/components/AnimalesParaAdoptar";
import FormularioAdopcion from "@/components/FormularioAdopcion";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { FaFolderOpen, FaListAlt, FaPaw, FaSignOutAlt } from "react-icons/fa";

export default function DashboardAdoptante({ adoptante }) {
    const [vista, setVista] = useState("animales");
    const [solicitudes, setSolicitudes] = useState([]);
    const [provincias, setProvincias] = useState([]);
    const [refugios, setRefugios] = useState([]);
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
    const [refugioSeleccionado, setRefugioSeleccionado] = useState(null);
    const [adopcionesPendientes, setAdopcionesPendientes] = useState([]);

    useEffect(() => {
        fetchAdopcionesPendientesFormulario();
    }, []);

    const fetchAdopcionesPendientesFormulario = async () => {
        const { data: adopciones } = await supabase
            .from("adopciones")
            .select("id, animal_id, formulario_iniciado")
            .eq("adoptante_id", adoptante.id)
            .eq("formulario_iniciado", true);

        setAdopcionesPendientes(adopciones || []);
    };

    useEffect(() => {
        fetchProvincias();
    }, []);

    useEffect(() => {
        if (provinciaSeleccionada) {
            fetchRefugios(provinciaSeleccionada);
        } else {
            setRefugios([]);
            setRefugioSeleccionado(null);
        }
    }, [provinciaSeleccionada]);
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };
    const fetchProvincias = async () => {
        const { data, error } = await supabase
            .from("refugios")
            .select("provincia")
            .neq("provincia", null);

        if (!error) {
            const unicas = [...new Set(data.map((r) => r.provincia))].sort();
            setProvincias(unicas);
        }
    };

    const fetchRefugios = async (provincia) => {
        const { data, error } = await supabase
            .from("refugios")
            .select("id, name")
            .eq("provincia", provincia);

        if (!error) {
            setRefugios(data);
            setRefugioSeleccionado(null);
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    const fetchSolicitudes = async () => {
        const { data, error } = await supabase
            .from("solicitudes_adopcion")
            .select("id, adoptante_id, animal_id, status, created_at, animal:animal_id(name, especie, imagen)")
            .eq("adoptante_id", adoptante.id)
            .order("created_at", { ascending: false });

        if (!error) setSolicitudes(data);
    };

    // Crear adopción pendiente si la solicitud es aceptada y no existe adopción
    useEffect(() => {
        if (solicitudes.length > 0) {
            solicitudes.forEach(async (s) => {
                if (s.status === "aceptada") {
                    const { data: adopcionExistente } = await supabase
                        .from("adopciones")
                        .select("id")
                        .eq("adoptante_id", s.adoptante_id)
                        .eq("animal_id", s.animal_id)
                        .maybeSingle();

                    if (!adopcionExistente) {
                        await supabase.from("adopciones").insert([{
                            adoptante_id: s.adoptante_id,
                            animal_id: s.animal_id,
                            formulario_iniciado: true
                        }]);
                        fetchAdopcionesPendientesFormulario();
                    }
                }
            });
        }
    }, [solicitudes]);

    // Cuando se envía el formulario, refresca adopciones pendientes y solicitudes
    const handleFormularioEnviado = () => {
        fetchAdopcionesPendientesFormulario();
        fetchSolicitudes();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-6">
            <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-3xl p-6 space-y-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-700 text-center">
                    Hola, {adoptante.name} 🐶
                </h1>

                <nav className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <TabButton
                        active={vista === "animales"}
                        onClick={() => setVista("animales")}
                        icon={<FaPaw />}
                        label="Animales en adopción"
                        activeColor="bg-purple-600 text-white"
                        inactiveColor="bg-gray-200 text-gray-700"
                    />
                    <TabButton
                        active={vista === "solicitudes"}
                        onClick={() => setVista("solicitudes")}
                        icon={<FaListAlt />}
                        label="Mis solicitudes"
                        activeColor="bg-green-600 text-white"
                        inactiveColor="bg-gray-200 text-gray-700"
                    />
                    <TabButton
                        active={vista === "recursos"}
                        onClick={() => setVista("recursos")}
                        icon={<FaFolderOpen />}
                        label="Consejos útiles"
                        activeColor="bg-blue-600 text-white"
                        inactiveColor="bg-gray-200 text-gray-700"
                    />
                </nav>

                {vista === "animales" && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={provinciaSeleccionada}
                            onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                            className="text-black border border-blue-200 rounded-lg px-4 py-2 w-full sm:w-auto focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Selecciona una provincia</option>
                            {provincias.map((prov) => (
                                <option key={prov} value={prov}>
                                    {prov}
                                </option>
                            ))}
                        </select>

                        <select
                            value={refugioSeleccionado?.id || ""}
                            onChange={(e) => {
                                const refugio = refugios.find((r) => r.id.toString() === e.target.value);
                                setRefugioSeleccionado(refugio || null);
                            }}
                            disabled={!refugios.length}
                            className="text-black border border-blue-200 rounded-lg px-4 py-2 w-full sm:w-auto focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Selecciona un refugio</option>
                            {refugios.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {vista === "animales" && (
                    <AnimalesParaAdoptar
                        adoptanteId={adoptante.id}
                        refugioId={refugioSeleccionado?.id || null}
                        onSolicitudEnviada={fetchSolicitudes}
                    />
                )}

                {vista === "solicitudes" && (
                    <ul className="space-y-4">
                        {solicitudes.length === 0 ? (
                            <p className="text-center text-gray-600 italic">
                                No tienes solicitudes realizadas.
                            </p>
                        ) : (
                            solicitudes.map((s) => {
                                const adopcionPendiente = adopcionesPendientes.find(
                                    (a) =>
                                        String(a.animal_id) === String(s.animal_id) &&
                                        a.formulario_iniciado === true
                                );
                                return (
                                    <li key={s.id} className="bg-purple-50 p-4 rounded-xl shadow flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={s.animal.imagen}
                                                alt={s.animal.name}
                                                className="w-20 h-20 rounded object-cover flex-shrink-0"
                                            />
                                            <div>
                                                <h4 className="font-bold text-lg">
                                                    {s.animal.name} ({s.animal.especie})
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Estado: <span className="font-semibold">{s.status}</span>
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Solicitada el {new Date(s.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Mostrar el formulario para cada solicitud aceptada que tenga adopción pendiente */}
                                        {s.status === "aceptada" && adopcionPendiente && (
                                            <FormularioAdopcion
                                                adopcion={adopcionPendiente}
                                                onFormularioEnviado={handleFormularioEnviado}
                                            />
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}
                {vista === "recursos" && (
                    <div className="bg-blue-50 p-6 rounded-xl text-gray-800">
                        <h2 className="text-xl font-bold mb-4">Consejos para la adopción</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Prepárate para una adaptación gradual del animal a tu hogar.</li>
                            <li>Ten listo un espacio seguro y tranquilo donde se sienta cómodo.</li>
                            <li>Consulta con el refugio ante cualquier duda de salud o comportamiento.</li>
                            <li>Acude al veterinario en los primeros días para una revisión general.</li>
                        </ul>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-transform duration-200 transform hover:scale-105"
                    type="button"
                    aria-label="Cerrar sesión"
                >
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </div>

    );
}

function TabButton({ active, onClick, icon, label, activeColor, inactiveColor }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${active ? activeColor : inactiveColor}`}
            aria-pressed={active}
            type="button"
        >
            <span className="text-lg">{icon}</span>
            {label}
        </button>
    );
}