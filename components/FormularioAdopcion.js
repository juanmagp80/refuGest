import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function FormularioAdopcion({ adopcion, onFormularioEnviado }) {
    const [motivo, setMotivo] = useState("");
    const [experiencia, setExperiencia] = useState("");
    const [vivienda, setVivienda] = useState("");
    const [tiempodisponible, setTiempodisponible] = useState("");
    const [gastosveterinario, setGastosveterinario] = useState("");
    const [ninosEnCasa, setNinosEnCasa] = useState("");
    const [otrosAnimales, setOtrosAnimales] = useState("");
    const [experienciaAdopcion, setExperienciaAdopcion] = useState("");
    const [comportamiento, setComportamiento] = useState("");
    const [espacioExterior, setEspacioExterior] = useState("");
    const [tiempoSolo, setTiempoSolo] = useState("");
    const [vacaciones, setVacaciones] = useState("");
    const [seguimiento, setSeguimiento] = useState("");
    const [recursosEmergencias, setRecursosEmergencias] = useState("");
    const [razonEleccion, setRazonEleccion] = useState("");
    const [mudanza, setMudanza] = useState("");
    const [esterilizacion, setEsterilizacion] = useState("");
    const [seguroVeterinario, setSeguroVeterinario] = useState("");
    const [expectativas, setExpectativas] = useState("");
    const [alergias, setAlergias] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error: insertError } = await supabase
                .from("formularios_adopcion")
                .insert({
                    adopcion_id: adopcion.id,
                    motivo,
                    experiencia,
                    vivienda,
                    tiempodisponible,
                    gastosveterinario,
                    ninos_en_casa: ninosEnCasa,
                    otros_animales: otrosAnimales,
                    experiencia_adopcion: experienciaAdopcion,
                    comportamiento,
                    espacio_exterior: espacioExterior,
                    tiempo_solo: tiempoSolo,
                    vacaciones,
                    seguimiento,
                    recursos_emergencias: recursosEmergencias,
                    razon_eleccion: razonEleccion,
                    mudanza,
                    esterilizacion,
                    seguro_veterinario: seguroVeterinario,
                    expectativas,
                    alergias,
                });
            if (insertError) throw insertError;

            const { error: updateError } = await supabase
                .from("adopciones")
                .update({ formulario_iniciado: false })
                .eq("id", adopcion.id);

            if (updateError) throw updateError;

            if (onFormularioEnviado) onFormularioEnviado();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto border-4 border-purple-200"
        >
            <h2 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 drop-shadow-lg">
                Formulario de adopción
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Motivo de adopción" value={motivo} onChange={setMotivo} required />
                <FormInput label="Experiencia con animales" value={experiencia} onChange={setExperiencia} required />
                <FormInput label="Tipo de vivienda" value={vivienda} onChange={setVivienda} required />
                <FormInput label="¿Hay niños en casa? ¿Qué edades?" value={ninosEnCasa} onChange={setNinosEnCasa} />
                <FormInput label="¿Tienes otros animales actualmente? ¿Cuáles?" value={otrosAnimales} onChange={setOtrosAnimales} />
                <FormInput label="¿Has adoptado antes? ¿Cómo fue la experiencia?" value={experienciaAdopcion} onChange={setExperienciaAdopcion} />
                <FormInput label="¿Qué harías si tu mascota tiene problemas de comportamiento?" value={comportamiento} onChange={setComportamiento} />
                <FormInput label="¿Tienes un espacio exterior (jardín, patio, terraza)? ¿Está cerrado?" value={espacioExterior} onChange={setEspacioExterior} />
                <FormInput label="Tiempo disponible" value={tiempodisponible} onChange={setTiempodisponible} required />
                <FormInput label="¿Cuánto tiempo estaría solo el animal al día?" value={tiempoSolo} onChange={setTiempoSolo} />
                <FormInput label="¿Quién cuidará del animal durante las vacaciones o ausencias?" value={vacaciones} onChange={setVacaciones} />
                <FormInput label="¿Estás dispuesto/a a realizar visitas de seguimiento?" value={seguimiento} onChange={setSeguimiento} />
                <FormInput label="¿Puedes afrontar gastos veterinarios?" value={gastosveterinario} onChange={setGastosveterinario} required />
                <FormInput label="¿Tienes recursos económicos para emergencias veterinarias?" value={recursosEmergencias} onChange={setRecursosEmergencias} />
                <FormInput label="¿Por qué has elegido este animal/especie en particular?" value={razonEleccion} onChange={setRazonEleccion} />
                <FormInput label="¿Qué harías si tuvieras que mudarte a un lugar donde no aceptan animales?" value={mudanza} onChange={setMudanza} />
                <FormInput label="¿Estás de acuerdo en esterilizar/castrar al animal si aún no lo está?" value={esterilizacion} onChange={setEsterilizacion} />
                <FormInput label="¿Tienes seguro veterinario o piensas contratarlo?" value={seguroVeterinario} onChange={setSeguroVeterinario} />
                <FormInput label="¿Qué expectativas tienes sobre la convivencia con el animal?" value={expectativas} onChange={setExpectativas} />
                <FormInput label="¿Hay alguien en casa con alergias a los animales?" value={alergias} onChange={setAlergias} />
            </div>
            {error && <p className="text-red-600 text-center">{error}</p>}
            <div className="flex justify-center">
                <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 hover:from-purple-700 hover:to-yellow-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition text-lg"
                    disabled={loading}
                >
                    {loading ? "Enviando..." : "Enviar formulario"}
                </button>
            </div>
        </form>
    );
}

function FormInput({ label, value, onChange, required }) {
    return (
        <div>
            <label className="block font-semibold text-purple-700 mb-1">{label}{required && <span className="text-pink-500">*</span>}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full border-2 border-pink-200 focus:border-purple-400 rounded-xl px-4 py-2 bg-white shadow-sm transition"
                required={required}
            />
        </div>
    );
}