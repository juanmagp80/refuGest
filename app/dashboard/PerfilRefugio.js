import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

function PerfilRefugio({ refugio, setRefugio }) {
    const [formData, setFormData] = useState({
        name: refugio.name || "",
        description: refugio.description || refugio.descripcion || "",
        location: refugio.location || "",
        contact_info: refugio.contact_info || "",
        provincia: refugio.provincia || "",
        logo_url: refugio.logo_url || "",
        banner_url: refugio.banner_url || "",
        redes_sociales: refugio.redes_sociales || {},
        info_lateral: refugio.info_lateral || "",
        teaming_url: refugio.teaming_url || "",
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    // Para simplificar, solo haremos inputs tipo texto. Puedes mejorar luego.

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            const { error } = await supabase
                .from("refugios")
                .update({
                    name: formData.name,
                    description: formData.description,
                    descripcion: formData.description, // para mantener compatibilidad con tu tabla
                    location: formData.location,
                    contact_info: formData.contact_info,
                    provincia: formData.provincia,
                    logo_url: formData.logo_url,
                    banner_url: formData.banner_url,
                    redes_sociales: formData.redes_sociales,
                    info_lateral: formData.info_lateral,
                    teaming_url: formData.teaming_url,
                })
                .eq("id", refugio.id);

            if (error) throw error;

            setMsg({ type: "success", text: "Perfil actualizado correctamente." });

            // Actualizamos el estado global del refugio con los datos nuevos
            setRefugio((old) => ({ ...old, ...formData }));
        } catch (error) {
            setMsg({ type: "error", text: "Error al actualizar el perfil: " + error.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-6 max-w-3xl mx-auto bg-white border border-blue-200 rounded-xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Editar perfil del refugio</h2>

            {msg && (
                <div
                    className={`p-3 rounded ${msg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                >
                    {msg.text}
                </div>
            )}

            <label className="block">
                <span className="font-semibold">Nombre</span>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Descripción corta</span>
                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Ubicación</span>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Información de contacto</span>
                <input
                    type="text"
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Provincia</span>
                <input
                    type="text"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
            </label>

            <label className="block">
                <span className="font-semibold">URL logo</span>
                <input
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="https://..."
                />
            </label>

            <label className="block">
                <span className="font-semibold">URL banner</span>
                <input
                    type="text"
                    name="banner_url"
                    value={formData.banner_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="https://..."
                />
            </label>

            <label className="block">
                <span className="font-semibold">Información lateral (texto)</span>
                <textarea
                    name="info_lateral"
                    value={formData.info_lateral}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    rows={4}
                />
            </label>

            <label className="block">
                <span className="font-semibold">URL Teaming</span>
                <input
                    type="text"
                    name="teaming_url"
                    value={formData.teaming_url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="https://..."
                />
            </label>

            <button
                disabled={saving}
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded shadow mt-4"
            >
                {saving ? "Guardando..." : "Guardar cambios"}
            </button>
        </div>
    );
}
export default PerfilRefugio;