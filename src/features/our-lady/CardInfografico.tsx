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
      viewport={{ once: true, amount: 0.2 }}
      className="flex flex-col items-start gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 h-full"
    >
      <h3 className="w-full bg-primary rounded-lg px-3 py-1 text-xl font-display text-secondary font-semibold leading-tight">
        {id}. {title}
      </h3>
      <div className="w-full">
        {lottieData || Icon ? (
          <div className={`w-14 h-14 flex-shrink-0 mb-3 ${item.image_position === 'float-start' || item.image_position === 'float-left' ? 'float-start mr-4' : 'float-end ml-4'}`}>
            {lottieData ? (
              <Lottie
                autoplay
                loop
                animationData={lottieData}
                style={{ height: "100%", width: "100%" }}
              />
            ) : Icon ? (
              <Icon size={56} className="text-accent" />
            ) : null}
          </div>
        ) : null}
        <p 
          className="text-base font-body text-base-content leading-relaxed" 
          dangerouslySetInnerHTML={{__html:body}} 
        />
      </div>
    </motion.div>
  );
}
