"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardRefugio from "./DashboardRefugio";
import DashboardVoluntario from "./DashboardVoluntario.js";

export default function DashboardPage() {
    const [userType, setUserType] = useState(null); // "voluntario" | "refugio" | null
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/login");
                return;
            }

            // Busca refugio
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

            // Busca voluntario
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

            // No encontrado ni refugio ni voluntario (¿error o usuario sin rol?)
            setUserType(null);
            setLoading(false);
        }
        fetchUser();
    }, [router]);

    if (loading) return <p className="text-center mt-10">Cargando dashboard...</p>;

    if (!userType) return <p className="text-center mt-10 text-red-600">No tienes acceso al dashboard.</p>;

    if (userType === "voluntario") return <DashboardVoluntario voluntario={userData} />;

    if (userType === "refugio") return <DashboardRefugio refugio={userData} />;

    return null;
}
