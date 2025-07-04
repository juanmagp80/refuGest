import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function FormularioAdopcion({ adopcion, onFormularioEnviado }) {
    const [motivo, setMotivo] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [vivienda, setVivienda] = useState("");
    const [tiempodisponible, setTiempodisponible] = useState("");
    const [gastosveterinario, setGastosveterinario] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase
                .from("formularios_adopcion")
                .insert({
                    adopcion_id: adopcion.id,
                    motivo,
                    experiencia,
                    vivienda,
                    tiempodisponible,
                    gastosveterinario,
                });
            if (error) throw error;

            // Opcional: marcar la adopción como formulario completado
            await supabase
                .from("adopciones")
                .update({ formulario_completado: true })
                .eq("id", adopcion.id);

            if (onFormularioEnviado) onFormularioEnviado();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Formulario de adopción</h2>
            <div>
                <label className="block font-semibold">Motivo de adopción</label>
                <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block font-semibold">Experiencia con animales</label>
                <input
                    type="text"
                    value={experiencia}
                    onChange={(e) => setExperiencia(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block font-semibold">Tipo de vivienda</label>
                <input
                    type="text"
                    value={vivienda}
                    onChange={(e) => setVivienda(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block font-semibold">Tiempo disponible</label>
                <input
                    type="text"
                    value={tiempodisponible}
                    onChange={(e) => setTiempodisponible(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            <div>
                <label className="block font-semibold">¿Puedes afrontar gastos veterinarios?</label>
                <input
                    type="text"
                    value={gastosveterinario}
                    onChange={(e) => setGastosveterinario(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    required
                />
            </div>
            {error && <p className="text-red-600">{error}</p>}
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Enviando..." : "Enviar formulario"}
            </button>
        </form>
    );
}