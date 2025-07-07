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
        redes_sociales: refugio.redes_sociales || "",
        info_lateral: refugio.info_lateral || "",
        teaming_url: refugio.teaming_url || "",
        asociacion: refugio.asociacion || "",
        albergue: refugio.albergue || "",
        manuales: refugio.manuales || "",
        colaboradores: refugio.colaboradores || "",
        calendario: refugio.calendario || "",
        web: refugio.web || "",
        facebook: refugio.facebook || "",
        instagram: refugio.instagram || "",
        email_red: refugio.email_red || "",
        adopta: refugio.adopta || "",
        socio: refugio.socio || "",
        voluntario: refugio.voluntario || "",
        difunde: refugio.difunde || "",
        dona: refugio.dona || ""


    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const handleUploadImage = async (file, tipo) => {
        if (!file) return;

        const setUploading = tipo === "logo" ? setUploadingLogo : setUploadingBanner;
        setUploading(true);

        const nombreArchivo = `${tipo}-${refugio.id}-${Date.now()}`;

        const { data, error } = await supabase.storage
            .from("images")
            .upload(nombreArchivo, file, {
                cacheControl: "3600",
                upsert: true,
            });

        if (error) {
            setMsg({ type: "error", text: `Error al subir ${tipo}: ` + error.message });
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage
            .from("images")
            .getPublicUrl(nombreArchivo);

        if (urlData?.publicUrl) {
            setFormData((f) => ({
                ...f,
                [`${tipo}_url`]: urlData.publicUrl,
            }));
            setMsg({ type: "success", text: `${tipo === "logo" ? "Logo" : "Banner"} actualizado correctamente.` });
        }

        setUploading(false);
    };

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
                    descripcion: formData.description,
                    location: formData.location,
                    contact_info: formData.contact_info,
                    provincia: formData.provincia,
                    logo_url: formData.logo_url,
                    banner_url: formData.banner_url,
                    redes_sociales: formData.redes_sociales,
                    info_lateral: formData.info_lateral,
                    teaming_url: formData.teaming_url,
                    asociacion: formData.asociacion,
                    albergue: formData.albergue,
                    manuales: formData.manuales,
                    colaboradores: formData.colaboradores,
                    calendario: formData.calendario,
                    web: formData.web,
                    facebook: formData.facebook,
                    instagram: formData.instagram,
                    email_red: formData.email_red,
                    adopta: formData.adopta,
                    socio: formData.socio,
                    voluntario: formData.voluntario,
                    difunde: formData.difunde,
                    dona: formData.dona,

                })
                .eq("id", refugio.id);

            if (error) throw error;

            setMsg({ type: "success", text: "Perfil actualizado correctamente." });
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

            {/* Logo actual */}
            {formData.logo_url && (
                <div className="mb-2">
                    <span className="font-semibold">Logo actual:</span>
                    <img src={formData.logo_url} alt="Logo" className="h-20 mt-2 rounded shadow" />
                </div>
            )}

            {/* Subir nuevo logo */}
            <div className="mb-4">
                <span className="font-semibold">Actualizar logo</span>
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="file"
                        accept="image/*"
                        id="logoInput"
                        onChange={(e) => setSelectedLogo(e.target.files[0])}
                        className="hidden"
                    />
                    <button
                        onClick={() => document.getElementById("logoInput").click()}
                        className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded shadow"
                    >
                        Seleccionar imagen
                    </button>
                    <button
                        disabled={!selectedLogo || uploadingLogo}
                        onClick={() => handleUploadImage(selectedLogo, "logo")}
                        className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded shadow ${uploadingLogo ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {uploadingLogo ? "Subiendo..." : "Subir logo"}
                    </button>
                </div>
            </div>

            {/* Banner actual */}
            {formData.banner_url && (
                <div className="mb-2">
                    <span className="font-semibold">Banner actual:</span>
                    <img src={formData.banner_url} alt="Banner" className="h-24 w-full object-cover mt-2 rounded shadow" />
                </div>
            )}

            {/* Subir nuevo banner */}
            <div className="mb-4">
                <span className="font-semibold">Actualizar banner</span>
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="file"
                        accept="image/*"
                        id="bannerInput"
                        onChange={(e) => setSelectedBanner(e.target.files[0])}
                        className="hidden"
                    />
                    <button
                        onClick={() => document.getElementById("bannerInput").click()}
                        className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded shadow"
                    >
                        Seleccionar imagen
                    </button>
                    <button
                        disabled={!selectedBanner || uploadingBanner}
                        onClick={() => handleUploadImage(selectedBanner, "banner")}
                        className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded shadow ${uploadingBanner ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {uploadingBanner ? "Subiendo..." : "Subir banner"}
                    </button>
                </div>
            </div>

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

            <label className="block">
                <span className="font-semibold">Asociación (quiénes somos)</span>
                <textarea
                    name="asociacion"
                    value={formData.asociacion}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    rows={2}
                />
            </label>

            <label className="block">
                <span className="font-semibold">Redes sociales (JSON o texto)</span>
                <textarea
                    name="redes_sociales"
                    value={formData.redes_sociales}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    rows={2}
                    placeholder='Ejemplo: {"facebook":"https://facebook.com/mi-refugio","instagram":"https://instagram.com/mi-refugio"}'
                />
            </label>

            <label className="block">
                <span className="font-semibold">Nuestro albergue</span>
                <textarea
                    name="albergue"
                    value={formData.albergue}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    rows={2}
                />
            </label>

            <label className="block">
                <span className="font-semibold">Manuales de ayuda</span>
                <textarea
                    name="manuales"
                    value={formData.manuales}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    rows={2}
                />
            </label>

            <label className="block">
                <span className="font-semibold">Profesionales colaboradores</span>
                <textarea
                    name="colaboradores"
                    value={formData.colaboradores}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    rows={2}
                />
            </label>

            <label className="block">
                <span className="font-semibold">Calendario de Google (URL)</span>
                <input
                    type="text"
                    name="calendario"
                    value={formData.calendario}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="URL del calendario"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Web</span>
                <input
                    type="text"
                    name="web"
                    value={formData.web}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Web (opcional)"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Facebook</span>
                <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Facebook (opcional)"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Instagram</span>
                <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Instagram (opcional)"
                />
            </label>

            <label className="block">
                <span className="font-semibold">Email de contacto</span>
                <input
                    type="text"
                    name="email_red"
                    value={formData.email_red}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Email de contacto (opcional)"
                />
            </label>
            <label className="block">
                <span className="font-semibold">Adopta</span>
                <input
                    type="text"
                    name="adopta"
                    value={formData.adopta}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Texto para sección Adopta"
                />
            </label>
            <label className="block">
                <span className="font-semibold">Socio</span>
                <input
                    type="text"
                    name="socio"
                    value={formData.socio}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Texto para sección Socio"
                />
            </label>
            <label className="block">
                <span className="font-semibold">Voluntario</span>
                <input
                    type="text"
                    name="voluntario"
                    value={formData.voluntario}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Texto para sección Voluntario"
                />
            </label>
            <label className="block">
                <span className="font-semibold">Difunde</span>
                <input
                    type="text"
                    name="difunde"
                    value={formData.difunde}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Texto para sección Difunde"
                />
            </label>
            <label className="block">
                <span className="font-semibold">Dona</span>
                <input
                    type="text"
                    name="dona"
                    value={formData.dona}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    placeholder="Texto para sección Dona"
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