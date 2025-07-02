"use client";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function DisponibilidadVoluntarios({ refugioId }) {
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroNombre, setFiltroNombre] = useState("");
    const [tareaForm, setTareaForm] = useState(null);

    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (refugioId) cargarDisponibilidad();
    }, [refugioId]);

    const cargarDisponibilidad = async () => {
        const { data, error } = await supabase
            .from("disponibilidad_voluntarios")
            .select(`
                id,
                dia,
                hora_inicio,
                hora_fin,
                volunteer_id,
                voluntarios ( id, name, refugio_id )
            `)
            .order("dia", { ascending: true });

        if (!error) {
            const filtrados = data.filter(d => d.voluntarios?.refugio_id === refugioId);
            setDisponibilidad(filtrados);
        }
    };

    const crearTarea = async () => {
        if (!taskName || !tareaForm?.volunteer_id) return;

        const { error } = await supabase.from("tareas_voluntarios").insert({
            volunteer_id: tareaForm.volunteer_id,
            task_name: taskName,
            description,
            dia: tareaForm.dia,
            hora_inicio: tareaForm.hora_inicio,
            hora_fin: tareaForm.hora_fin,
            status: "Por aceptar"
        });

        if (!error) {
            setTareaForm(null);
            setTaskName("");
            setDescription("");
            alert("Tarea asignada con estado 'Por aceptar' 🎉");
        } else {
            console.error("Error asignando tarea", error);
            alert("Ups, algo salió mal. Intenta de nuevo.");
        }
    };

    const disponibilidadFiltrada = disponibilidad.filter((d) => {
        const coincideDia = filtroDia ? d.dia === filtroDia : true;
        const coincideNombre = filtroNombre
            ? d.voluntarios?.name.toLowerCase().includes(filtroNombre.toLowerCase())
            : true;
        return coincideDia && coincideNombre;
    });

    return (
        <div className="p-4 sm:p-8 bg-gradient-to-tr from-blue-50 via-white to-blue-100 rounded-2xl shadow-xl border border-blue-300 max-w-4xl mx-auto mt-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-800 mb-6 select-none drop-shadow-md text-center">
                Disponibilidad de voluntarios
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                    type="date"
                    value={filtroDia}
                    onChange={(e) => setFiltroDia(e.target.value)}
                    className="border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
                    placeholder="Filtrar por día"
                />
                <input
                    type="text"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    className="border border-blue-300 rounded-lg px-3 py-2 text-sm shadow-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
                    placeholder="Buscar voluntario por nombre"
                />
            </div>

            <ul className="space-y-3 max-h-[380px] sm:max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
                {disponibilidadFiltrada.length === 0 && (
                    <p className="text-center text-gray-500 mt-10 select-none text-sm sm:text-base">
                        No se encontraron registros con esos filtros.
                    </p>
                )}

                {disponibilidadFiltrada.map((item) => (
                    <li
                        key={item.id}
                        className="bg-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:shadow-blue-500/30 transition-shadow cursor-default select-text"
                    >
                        <div className="text-blue-900 font-semibold text-lg sm:text-xl">
                            {item.voluntarios?.name}
                        </div>
                        <div className="text-blue-700 text-xs sm:text-sm">
                            <span className="font-medium">📅 {item.dia}</span> — de{" "}
                            <span className="font-mono">{item.hora_inicio}</span> a{" "}
                            <span className="font-mono">{item.hora_fin}</span>
                        </div>
                        <button
                            onClick={() =>
                                setTareaForm({
                                    volunteer_id: item.volunteer_id,
                                    dia: item.dia,
                                    hora_inicio: item.hora_inicio,
                                    hora_fin: item.hora_fin,
                                })
                            }
                            className="text-blue-600 hover:text-blue-800 underline font-medium text-sm sm:text-base transition"
                            aria-label={`Asignar tarea a ${item.voluntarios?.name}`}
                        >
                            Asignar tarea
                        </button>
                    </li>
                ))}
            </ul>

            {tareaForm && (
                <div className="mt-8 bg-white p-4 sm:p-6 rounded-xl shadow-lg max-w-lg mx-auto border border-blue-300 animate-fade-in">
                    <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-4 select-none text-center">
                        Nueva tarea para voluntario
                    </h3>
                    <p className="mb-6 text-sm sm:text-base text-blue-600 select-text text-center">
                        <strong>{tareaForm.dia}</strong> de <code>{tareaForm.hora_inicio}</code> a{" "}
                        <code>{tareaForm.hora_fin}</code>
                    </p>
                    <input
                        type="text"
                        placeholder="Nombre de la tarea"
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 mb-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                    />
                    <textarea
                        placeholder="Descripción (opcional)"
                        rows={4}
                        className="w-full border border-blue-300 rounded-lg px-3 py-2 mb-6 resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3">
                        <button
                            onClick={crearTarea}
                            className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold shadow-lg transition transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
                        >
                            Guardar tarea
                        </button>
                        <button
                            onClick={() => {
                                setTareaForm(null);
                                setTaskName("");
                                setDescription("");
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium transition underline text-sm sm:text-base"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
