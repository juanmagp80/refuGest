"use client";

import GestionSolicitudesAdopcion from "@/components/GestionSolicitudesAdopcion.js";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardAdoptante from "./DashboardAdoptante.js";
import DashboardRefugio from "./DashboardRefugio";
import DashboardVoluntario from "./DashboardVoluntario.js";
console.log("GestionSolicitudesAdopcion:", GestionSolicitudesAdopcion);
export default function DashboardPage() {
    const [userType, setUserType] = useState(null); // "voluntario" | "refugio" | null
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const router = useRouter();
    const [adoptante, setAdoptante] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Refugio
            const { data: refugioData } = await supabase
                .from("refugios")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (refugioData) {
                setUserType("refugio");
                setUserData(refugioData);
                setLoading(false);
                return;
            }

            // Voluntario
            const { data: voluntarioData } = await supabase
                .from("voluntarios")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (voluntarioData) {
                setUserType("voluntario");
                setUserData(voluntarioData);
                setLoading(false);
                return;
            }

            // Adoptante
            const { data: adoptanteData } = await supabase
                .from("adoptantes")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (adoptanteData) {
                setUserType("adoptante");
                setUserData(adoptanteData);
                setLoading(false);
                return;
            }

            // No tiene rol
            setUserType(null);
            setLoading(false);
        }
        fetchUser();

    }, [router]);
    if (loading) return <p className="text-center mt-10">Cargando dashboard...</p>;

    if (!userType) return <p className="text-center mt-10 text-red-600">No tienes acceso al dashboard.</p>;

    if (userType === "refugio") return <DashboardRefugio refugio={userData} />;
    if (userType === "voluntario") return <DashboardVoluntario voluntario={userData} />;
    if (userType === "adoptante") return <DashboardAdoptante adoptante={userData} />;




    return null;
}
