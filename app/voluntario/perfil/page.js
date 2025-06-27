"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function PerfilVoluntarioPage() {
    const [voluntario, setVoluntario] = useState(null);
    const [refugios, setRefugios] = useState([]);
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        refugio_id: ""
    });
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            const { data: { user }, error: errorUser } = await supabase.auth.getUser();

            if (errorUser || !user) {
                console.error("Error al obtener usuario:", errorUser);
                setCargando(false);
                return;
            }

            const { data: voluntarioData, error: errorVol } = await supabase
                .from("voluntarios")
                .select("id, name, user_id, refugio_id")
                .eq("user_id", user.id)
                .single();

            if (!voluntarioData || errorVol) {
                console.error("No se encontró el voluntario:", errorVol);
                setCargando(false);
                return;
            }

            setVoluntario(voluntarioData);
            setForm({
                nombre: voluntarioData.name,
                email: user.email,
                refugio_id: voluntarioData.refugio_id
            });

            const { data: refugiosData, error: errorRef } = await supabase
                .from("refugios")
                .select("id, name");

            if (errorRef) {
                console.error("Error al obtener refugios:", errorRef);
            } else {
                setRefugios(refugiosData || []);
            }

            setCargando(false);
        };

        cargarDatos();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!voluntario) return;

        const { error: errorVolUpdate } = await supabase
            .from("voluntarios")
            .update({
                name: form.nombre,
                refugio_id: form.refugio_id
            })
            .eq("id", voluntario.id);

        const { error: errorEmailUpdate } = await supabase.auth.updateUser({
            email: form.email
        });

        if (errorVolUpdate || errorEmailUpdate) {
            console.error("Errores al actualizar:", errorVolUpdate, errorEmailUpdate);
            setMensaje("❌ Error al guardar los cambios.");
        } else {
            setMensaje("✅ Cambios guardados correctamente.");
        }
    };

    if (cargando) {
        return <div className="p-10 text-center text-gray-600">Cargando perfil...</div>;
    }

    if (!voluntario) {
        return <div className="p-10 text-center text-red-600">No se encontró tu perfil de voluntario.</div>;
    }

    return (
        <div className="max-w-xl mx-auto mt-24 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h1 className="text-3xl font-bold text-blue-700 mb-6">Editar Perfil</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Refugio</label>
                    <select
                        name="refugio_id"
                        value={form.refugio_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Selecciona un refugio</option>
                        {refugios.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                    Guardar cambios
                </button>

                {mensaje && (
                    <p className={`mt-3 text-sm ${mensaje.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                        {mensaje}
                    </p>
                )}
            </form>
        </div>
    );
}
