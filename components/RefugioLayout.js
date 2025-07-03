export default function RefugioLayout({ refugio, children }) {
    return (
        <div className="min-h-screen bg-orange-50">
            {/* Banner */}
            <div
                className="h-64 bg-center bg-cover"
                style={{ backgroundImage: `url(${refugio.banner_url})` }}
            ></div>

            {/* Logo y nombre */}
            <div className="max-w-6xl mx-auto -mt-20 flex items-center gap-6 px-4">
                <img
                    src={refugio.logo_url || "/images/default-logo.png"}
                    alt={refugio.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white"
                />
                <div>
                    <h1 className="text-3xl font-bold text-orange-800">{refugio.name}</h1>
                    <p className="text-gray-600">{refugio.descripcion}</p>
                </div>
            </div>

            {/* Menú */}
            <div className="bg-orange-200 mt-6">
                <div className="max-w-6xl mx-auto flex gap-6 px-6 py-3 text-gray-800 font-semibold">
                    <a href="#info">Información</a>
                    <a href="#animales">Animales</a>
                    {refugio.teaming_url && (
                        <a href={refugio.teaming_url} target="_blank" rel="noreferrer">
                            Teaming
                        </a>
                    )}
                </div>
            </div>

            {/* Info lateral (opcional) */}
            {refugio.info_lateral && (
                <aside className="max-w-6xl mx-auto px-6 py-4 text-sm text-gray-700 bg-orange-100 rounded-xl shadow mt-6">
                    {refugio.info_lateral}
                </aside>
            )}

            {/* Contenido */}
            <main>{children}</main>
        </div>
    );
}
