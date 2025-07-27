// features/nossa-senhora/NossaSenhoraPage.tsx
"use client";

import Image from "next/image";
import CardInfografico from "./CardInfografico";
import NossaSenhoraDoAmorMissericordioso from "./images/NSenhoraAM.svg";
// import { cormorant, lora } from './fonts';
import { infograficoData } from "./infograficoData";

export default function NossaSenhoraPage() {
  return (
    // ${cormorant.variable} ${lora.variable}
    <div data-theme="nossa-senhora-light">
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
          <p className="mt-4 text-2xl text-primary">
            Mãe, Mestra e Formadora do Amor Misericordioso
          </p>
        </header>
        <main className="columns-1 md:columns-2 gap-6">
          {infograficoData.map((item) => (
            <CardInfografico key={item.id} {...item} />
          ))}
        </main>
      </div>
    </div>
  );
}
