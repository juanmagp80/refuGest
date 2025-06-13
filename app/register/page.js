"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        email: "",
        password: "",
        name: "",
        location: "",
        contact_info: "",
        description: "",
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 1. Registrar usuario
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        const user = signUpData.user;
        if (!user) {
            setError("No se pudo crear el usuario.");
            return;
        }

        // 2. Crear refugio asociado
        const { error: refugioError } = await supabase
            .from("refugios")
            .insert([
                {
                    name: form.name,
                    location: form.location,
                    contact_info: form.contact_info,
                    description: form.description,
                    user_id: user.id,
                },
            ]);

        if (refugioError) {
            setError(refugioError.message);
            return;
        }

        // 3. Redirigir al dashboard
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-80">
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
                <input name="name" placeholder="Nombre del refugio" value={form.name} onChange={handleChange} required />
                <input name="location" placeholder="Ubicación" value={form.location} onChange={handleChange} required />
                <input name="contact_info" placeholder="Contacto" value={form.contact_info} onChange={handleChange} required />
                <textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} required />
                {error && <p className="text-red-600">{error}</p>}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Registrarse</button>
            </form>
        </div>
    );
}