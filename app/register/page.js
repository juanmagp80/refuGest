"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaEnvelope,
    FaHome,
    FaLock,
    FaMapMarkerAlt,
    FaPaw,
    FaPhone,
    FaUser,
} from "react-icons/fa";

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        provincia: "",
        contact_info: "",
        user_type: "",
        refugio_id: "",
        logo_url: "",
        banner_url: "",
        descripcion: "",
        web: "",
        facebook: "",
        instagram: "",
        email_red: "",
        teaming_url: "",
        info_lateral: "",
    });

    const [error, setError] = useState(null);
    const [refugios, setRefugios] = useState([]);
    const [animales, setAnimales] = useState([]);
    const [popup, setPopup] = useState({ visible: false, type: "", message: "" });

    const provincias = [
        "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila",
        "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria",
        "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada",
        "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares",
        "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lleida",
        "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense",
        "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife",
        "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
        "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza", "Ceuta", "Melilla",
    ];

    useEffect(() => {
        const fetchRefugios = async () => {
            if (form.user_type === "voluntario" && form.provincia) {
                const { data, error } = await supabase
                    .from("refugios")
                    .select("id, name")
                    .eq("provincia", form.provincia);

                if (!error) setRefugios(data);
            } else {
                setRefugios([]);
            }
        };

        fetchRefugios();
    }, [form.provincia, form.user_type]);

    useEffect(() => {
        if (form.user_type === "voluntario" && form.refugio_id) {
            const fetchAnimals = async () => {
                const { data, error } = await supabase
                    .from("animales")
                    .select("*")
                    .eq("refugio_id", form.refugio_id);

                if (error) {
                    console.error("Error al cargar los animales:", error);
                    return;
                }

                setAnimales(data);
            };

            fetchAnimals();
        } else {
            setAnimales([]);
        }
    }, [form.refugio_id, form.user_type]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    async function handleFileUpload(e, field) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;

            const { data, error } = await supabase.storage
                .from("images")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                });

            if (error) {
                console.error("Error subiendo archivo:", error);
                mostrarPopup("error", `Error subiendo archivo: ${error.message}`);
                return;
            }

            // Obtener URL pública
            const { data: publicUrlData, error: urlError } = supabase.storage
                .from("images")
                .getPublicUrl(fileName);

            if (urlError) {
                console.error("Error obteniendo URL pública:", urlError);
                mostrarPopup("error", "Error al obtener URL pública");
                return;
            }

            setForm((prev) => ({
                ...prev,
                [field]: publicUrlData.publicUrl,
            }));

            mostrarPopup("success", "Imagen subida correctamente");
        } catch (err) {
            console.error("Error inesperado:", err);
            mostrarPopup("error", "Error inesperado al subir imagen");
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });

        if (signUpError) {
            const msg =
                signUpError.message.includes("invalid") && signUpError.message.includes(form.email)
                    ? "Este correo electrónico ya está registrado. Intenta iniciar sesión o recuperar tu contraseña."
                    : signUpError.message;

            mostrarPopup("error", msg);
            return;
        }

        if (signUpData?.user) {
            mostrarPopup("success", "Usuario creado correctamente. Revisa tu correo para confirmar la cuenta.");
        } else {
            setError("No se pudo crear el usuario.");
            return;
        }

        const user = signUpData.user;

        let tableName =
            form.user_type === "refugio"
                ? "refugios"
                : form.user_type === "voluntario"
                    ? "voluntarios"
                    : "adoptantes";

        const insertData = {
            name: form.name,
            provincia: form.provincia,
            contact_info: form.contact_info,
            user_id: user.id,
        };

        if (form.user_type === "refugio") insertData.location = form.provincia;
        if (form.user_type === "voluntario") insertData.refugio_id = form.refugio_id;

        if (form.logo_url) insertData.logo_url = form.logo_url;
        if (form.banner_url) insertData.banner_url = form.banner_url;

        const { error: insertError } = await supabase.from(tableName).insert([insertData]);

        if (insertError) {
            mostrarPopup("error", insertError.message);
            return;
        }

        router.push("/dashboard");
    };

    const mostrarPopup = (tipo, mensaje) => {
        setPopup({ visible: true, type: tipo, message: mensaje });
        setTimeout(() => setPopup({ visible: false, type: "", message: "" }), 4000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-fade-in">
            {popup.visible && (
                <div
                    className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-xl text-white text-center font-semibold transition-all duration-300 ${popup.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                >
                    {popup.message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col gap-6 border-2 border-blue-200 animate-slide-up"
            >
                <div className="flex flex-col items-center gap-2 mb-2">
                    <FaPaw className="text-4xl text-pink-500 drop-shadow" />
                    <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg">
                        Registro de usuario
                    </h1>
                    <p className="text-gray-500 text-sm">Crea tu cuenta como refugio, voluntario o adoptante</p>
                </div>

                {/* Tipo de usuario */}
                <div className="relative">
                    <FaUser className="absolute left-3 top-3 text-indigo-400" />
                    <select
                        name="user_type"
                        value={form.user_type}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-indigo-200 rounded-lg py-2 w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    >
                        <option value="">Selecciona tipo de usuario</option>
                        <option value="refugio">Refugio</option>
                        <option value="voluntario">Voluntario</option>
                        <option value="adoptante">Adoptante</option>
                    </select>
                </div>

                {/* Email */}
                <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
                    <input
                        name="email"
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-blue-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    />
                </div>

                {/* Contraseña */}
                <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-purple-400" />
                    <input
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-purple-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    />
                </div>

                {/* Nombre */}
                <div className="relative">
                    <FaHome className="absolute left-3 top-3 text-yellow-400" />
                    <input
                        name="name"
                        placeholder={
                            form.user_type === "refugio"
                                ? "Nombre del refugio"
                                : form.user_type === "voluntario"
                                    ? "Nombre del voluntario"
                                    : "Nombre del adoptante"
                        }
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-yellow-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                    />
                </div>

                {/* Provincia */}
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-3 text-green-400" />
                    <select
                        name="provincia"
                        value={form.provincia}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-green-200 rounded-lg py-2 w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                    >
                        <option value="">Selecciona una provincia</option>
                        {provincias.map((provincia) => (
                            <option key={provincia} value={provincia}>
                                {provincia}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Condicional refugio */}
                {form.user_type === "refugio" && (
                    <>
                        {/* Logo */}
                        <div>
                            <label className="block mb-1 font-semibold text-sm text-gray-600">Logo del refugio (sube tu imagen)</label>
                            <label
                                htmlFor="logo-upload"
                                className="inline-block cursor-pointer bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded font-semibold shadow-lg transition duration-300 select-none"
                            >
                                Seleccionar imagen
                            </label>
                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "logo_url")}
                                className="hidden"
                            />

                            {form.logo_url && (
                                <div className="flex justify-center mt-2">
                                    <img
                                        src={form.logo_url}
                                        alt="Logo del refugio"
                                        className="w-24 h-24 object-contain border-4 border-blue-300 rounded-full shadow"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Banner */}
                        <div>
                            <label className="block mb-1 font-semibold text-sm text-gray-600">
                                Banner principal (sube tu imagen)
                            </label>
                            <label
                                htmlFor="banner-upload"
                                className="inline-block cursor-pointer bg-gradient-to-r from-green-400 via-teal-400 to-cyan-500 hover:from-green-500 hover:via-teal-500 hover:to-cyan-600 text-white px-5 py-2 rounded font-semibold shadow-lg transition duration-300 select-none"
                            >
                                Seleccionar imagen
                            </label>
                            <input
                                id="banner-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "banner_url")}
                                className="hidden"
                            />

                            {form.banner_url && (
                                <div className="flex justify-center mt-2">
                                    <img
                                        src={form.banner_url}
                                        alt="Banner principal"
                                        className="w-full max-h-40 object-contain rounded-lg shadow"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block mb-1 font-semibold text-sm text-gray-600">
                                Descripción del refugio
                            </label>
                            <textarea
                                name="descripcion"
                                placeholder="Somos un refugio con más de 20 años de experiencia..."
                                value={form.descripcion}
                                onChange={handleChange}
                                rows={3}
                                className="border-2 border-blue-200 rounded-lg py-2 px-3 w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            />
                        </div>

                        {/* Redes sociales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                name="web"
                                placeholder="Web (opcional)"
                                value={form.web}
                                onChange={handleChange}
                                className="border-2 border-indigo-200 rounded-lg py-2 px-3 w-full text-black"
                            />
                            <input
                                name="facebook"
                                placeholder="Facebook (opcional)"
                                value={form.facebook}
                                onChange={handleChange}
                                className="border-2 border-indigo-200 rounded-lg py-2 px-3 w-full text-black"
                            />
                            <input
                                name="instagram"
                                placeholder="Instagram (opcional)"
                                value={form.instagram}
                                onChange={handleChange}
                                className="border-2 border-indigo-200 rounded-lg py-2 px-3 w-full text-black"
                            />
                            <input
                                name="email_red"
                                placeholder="Email de contacto (opcional)"
                                value={form.email_red}
                                onChange={handleChange}
                                className="border-2 border-indigo-200 rounded-lg py-2 px-3 w-full text-black"
                            />
                        </div>

                        {/* Teaminig */}


                        {/* Info lateral */}
                        <div>
                            <label className="block mb-1 font-semibold text-sm text-gray-600">
                                Texto lateral (HTML o texto plano)
                            </label>
                            <textarea
                                name="info_lateral"
                                placeholder="Texto informativo que se mostrará en la barra lateral..."
                                value={form.info_lateral}
                                onChange={handleChange}
                                rows={4}
                                className="border-2 border-orange-200 rounded-lg py-2 px-3 w-full text-black"
                            />
                        </div>
                    </>
                )}

                {/* Voluntario */}
                {form.user_type === "voluntario" && (
                    <div className="relative">
                        <FaHome className="absolute left-3 top-3 text-pink-400" />
                        <select
                            name="refugio_id"
                            value={form.refugio_id}
                            onChange={handleChange}
                            required
                            className="pl-10 border-2 border-pink-200 rounded-lg py-2 w-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                        >
                            <option value="">Selecciona refugio</option>
                            {refugios.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Contacto */}
                <div className="relative">
                    <FaPhone className="absolute left-3 top-3 text-pink-400" />
                    <input
                        name="contact_info"
                        placeholder="Contacto"
                        value={form.contact_info}
                        onChange={handleChange}
                        required
                        className="pl-10 border-2 border-pink-200 rounded-lg py-2 w-full text-black focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                    />
                </div>

                {error && <div className="text-red-600 text-center font-semibold">{error}</div>}

                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Registrarse
                </button>
            </form>

            <style jsx global>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.7s ease forwards;
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease forwards;
                }
            `}</style>
        </div>
    );
}
