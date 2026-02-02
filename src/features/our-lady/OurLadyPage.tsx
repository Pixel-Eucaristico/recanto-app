// features/nossa-senhora/NossaSenhoraPage.tsx
"use client";

import Image from "next/image";
import CardInfografico from "./CardInfografico";
import NossaSenhoraDoAmorMissericordioso from "./images/NSenhoraAM.svg";
// import { cormorant, lora } from './fonts';
import { infograficoData } from "./infograficoData";

import { useState } from "react";
import { LuLayoutGrid, LuStretchHorizontal } from "react-icons/lu";

export default function OurLadyPage() {
  const [columns, setColumns] = useState(2);

  return (
    <div className={`px-6 py-12 max-w-4xl mx-auto font-nossa-senhora-body`}>
      <header className="text-center mb-10">
        <Image
          src={NossaSenhoraDoAmorMissericordioso.src}
          alt="Logo Nossa Senhora Mãe do Amor Misericordioso"
          width={150}
          height={150}
          className="mx-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-4xl md:text-5xl font-semibold text-primary font-nossa-senhora-title">
          Nossa Senhora Mãe do Amor Misericordioso
        </h1>
        <p className="mt-4 text-2xl text-primary mb-8">
          Mãe, Mestra e Formadora do Amor Misericordioso
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setColumns(1)}
            className={`btn btn-sm ${columns === 1 ? "btn-primary" : "btn-outline btn-primary"}`}
            title="Ver em 1 coluna"
          >
            <LuStretchHorizontal size={18} />
            <span className="hidden sm:inline ml-2">1 Coluna</span>
          </button>
          <button
            onClick={() => setColumns(2)}
            className={`btn btn-sm ${columns === 2 ? "btn-primary" : "btn-outline btn-primary"}`}
            title="Ver em 2 colunas"
          >
            <LuLayoutGrid size={18} />
            <span className="hidden sm:inline ml-2">2 Colunas</span>
          </button>
        </div>
      </header>

      <main 
        className={`grid gap-6 transition-all duration-500 ease-in-out ${
          columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {infograficoData.map((item) => (
          <CardInfografico key={item.id} {...item} />
        ))}
      </main>
    </div>
  );
}
