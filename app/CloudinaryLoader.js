"use client";

import Script from "next/script";

export default function CloudinaryLoader() {
    return (
        <Script
            src="https://widget.cloudinary.com/v2.0/global/all.js"
            strategy="afterInteractive"
            onLoad={() => {
                console.log("Cloudinary script cargado correctamente");
            }}
        />
    );
}
