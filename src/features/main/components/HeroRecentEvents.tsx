'use client';

import { motion } from 'framer-motion';

export default function HeroRecentEvents() {
  const events = [
    {
      title: "Retiro Espiritual Jovem",
      date: "24 a 26 de Agosto",
      location: "Casa de Retiro São João",
      description: "Momentos de oração, formação e partilha para juventude.",
    },
    {
      title: "Adoração com Música ao Vivo",
      date: "03 de Setembro - 19h",
      location: "Capela do Recanto",
      description:
        "Uma noite de louvor, adoração e profunda experiência com Deus.",
    },
    {
      title: "Missão nas Ruas",
      date: "10 de Setembro - 14h",
      location: "Centro de Sumaré",
      description: "Evangelização com os irmãos em situação de rua.",
    },
    {
      title: "Retiro Espiritual de Jovens",
      date: "15 a 17 de Agosto de 2025",
      location: "Sítio Esperança, Atibaia - SP",
      description:
        "Um final de semana de profunda espiritualidade, com momentos de oração, adoração, louvor e convivência fraterna. Voltado especialmente para jovens que buscam fortalecer sua fé e vivência comunitária.",
    },
  ];

  return (
    <section className="py-16 bg-base-100 text-base-content">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Eventos Recentes
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto">
          Acompanhe os momentos que marcaram nossa comunidade e venha participar
          conosco dos próximos!
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {events.map((event, index) => (
            <motion.div
              key={index}
              className="w-full max-w-sm card bg-base-200 shadow-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="card-body">
                <h3 className="card-title text-xl font-semibold">
                  {event.title}
                </h3>
                <p className="text-sm text-base-content/70">
                  {event.date} • {event.location}
                </p>
                <p className="mt-2">{event.description}</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">Saiba mais</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
