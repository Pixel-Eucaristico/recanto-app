// features/nossa-senhora/CardInfografico.tsx
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { infograficoData } from "./infograficoData";

export default function CardInfografico(item: typeof infograficoData[number]) {
  const { id, title, body, icon: Icon, lottie: lottieData } = item;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.4 }}
      className="break-inside-avoid pl-4 flex flex-col items-start gap-4 bg-base-100 p-2"
    >
      <h3 className="w-full bg-primary rounded-lg px-3 text-xl font-display text-secondary font-semibold">
        {id}. {title}
      </h3>
      <div>
        {}
        <div className={`w-12 h-12 flex-shrink-0 ${item.image_position} mr-3`}>
          {lottieData ? (
            <Lottie
              autoplay
              loop
              animationData={lottieData}
              style={{ height: "100%", width: "100%" }}
            />
          ) : Icon ? (
            <Icon size={48} className="text-accent" />
          ) : null}
        </div>
        <p className="mt-1 text-base font-body text-base-content" dangerouslySetInnerHTML={{__html:body}} />
      </div>
    </motion.div>
  );
}
