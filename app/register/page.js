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
    FaUser
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
    });

    const [error, setError] = useState(null);
    const [refugios, setRefugios] = useState([]);
    const [animales, setAnimales] = useState([]);  // Estado para almacenar los animales cargados

    const provincias = [
        "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz",
        "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real",
        "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva",
        "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León",
        "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia",
        "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria",
        "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza",
        "Ceuta", "Melilla"
    ];

    useEffect(() => {
        const fetchRefugios = async () => {
            if (form.user_type === "voluntario" && form.provincia) {
                const { data, error } = await supabase
                    .from("refugios")
                    .select("id, name")
                    .eq("provincia", form.provincia);

                if (!error) setRefugios(data);
            }
        };

        fetchRefugios();
    }, [form.provincia, form.user_type]);

    // Cargar animales cuando se selecciona el refugio
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

                setAnimales(data);  // Guardamos los animales en el estado
            };

            fetchAnimals();
        }
    }, [form.refugio_id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });

        if (signUpError) {
            if (
                signUpError.message.includes("invalid") &&
                signUpError.message.includes(form.email)
            ) {
                setError(
                    "Este correo electrónico ya está registrado. Intenta iniciar sesión o recuperar tu contraseña."
                );
            } else {
                setError(signUpError.message);
            }
            return;
        }


        if (signUpData?.user) {
            alert(
                "Usuario creado correctamente. Por favor revisa tu correo para confirmar tu cuenta."
            );
        } else {
            setError("No se pudo crear el usuario.");
            return;
        }

        const user = signUpData.user;

        // Insertar en la tabla correspondiente
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

        const { error: insertError } = await supabase.from(tableName).insert([insertData]);

        if (insertError) {
            setError(insertError.message);
            return;
        }

        router.push("/dashboard");
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 animate-fade-in">
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

                {/* Refugio selector si es voluntario */}
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
                    animation: fade-in 1s ease;
                }
                @keyframes slide-up {
                    from {
                        transform: translateY(40px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s cubic-bezier(0.4, 2, 0.6, 1) 0.1s both;
                }
            `}</style>
        </div>
    );
}
