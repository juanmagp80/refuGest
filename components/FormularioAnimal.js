"use client";

import { useState } from "react";
import {
    FaCalendarAlt,
    FaCheckCircle,
    FaInfoCircle, FaNotesMedical,
    FaSyringe, FaUserMd
} from "react-icons/fa";

export default function FormularioAnimal({ animal, camposEditables = [], onSuccess }) {
    const [form, setForm] = useState(animal);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { error: updateError } = await supabase
            .from("animales")
            .update({ ...form })
            .eq("id", animal.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess("Animal actualizado correctamente.");
            if (onSuccess) onSuccess();
        }
    };

    const openCloudinaryWidget = () => {
        window.cloudinary.openUploadWidget(
            {
                cloudName: "dmx84o0ye",
                uploadPreset: "animales",
                sources: ["local", "url", "camera"],
                multiple: false,
                cropping: false,
                defaultSource: "local"
            },
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setForm({ ...form, imagen: result.info.secure_url });
                }
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Editar información</h2>

            {camposEditables.includes("descripcion") && (
                <TextArea name="descripcion" icon={<FaInfoCircle />} placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
            )}
            {camposEditables.includes("vacunas") && (
                <TextArea name="vacunas" icon={<FaSyringe />} placeholder="Vacunas" value={form.vacunas} onChange={handleChange} />
            )}
            {camposEditables.includes("enfermedades") && (
                <TextArea name="enfermedades" icon={<FaNotesMedical />} placeholder="Enfermedades" value={form.enfermedades} onChange={handleChange} />
            )}
            {camposEditables.includes("tratamientos") && (
                <TextArea name="tratamientos" icon={<FaNotesMedical />} placeholder="Tratamientos" value={form.tratamientos} onChange={handleChange} />
            )}
            {camposEditables.includes("observaciones") && (
                <TextArea name="observaciones" icon={<FaInfoCircle />} placeholder="Observaciones" value={form.observaciones} onChange={handleChange} />
            )}
            {camposEditables.includes("ultima_visita") && (
                <Input name="ultima_visita" type="date" icon={<FaCalendarAlt />} value={form.ultima_visita || ""} onChange={handleChange} />
            )}
            {camposEditables.includes("veterinario") && (
                <Input name="veterinario" icon={<FaUserMd />} placeholder="Veterinario" value={form.veterinario} onChange={handleChange} />
            )}

            {camposEditables.includes("imagen") && (
                <>
                    <button
                        type="button"
                        onClick={openCloudinaryWidget}
                        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
                    >
                        Subir imagen
                    </button>
                    {form.imagen && (
                        <img src={form.imagen} alt="Animal" className="w-32 h-32 object-cover rounded-full mt-2 border" />
                    )}
                </>
            )}

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600 flex items-center gap-2"><FaCheckCircle /> {success}</p>}

            <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600"
            >
                Guardar
            </button>
        </form>
    );
}

function Input({ name, icon, ...props }) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <input
                name={name}
                {...props}
                className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-full"
            />
        </div>
    );
}

function TextArea({ name, icon, ...props }) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-3 text-blue-400">{icon}</span>
            <textarea
                name={name}
                {...props}
                className="text-black border-2 border-blue-200 rounded-lg px-9 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-h-[60px] w-full"
            />
        </div>
    );
}
