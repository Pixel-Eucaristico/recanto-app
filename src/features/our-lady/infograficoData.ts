// features/nossa-senhora/infograficoData.ts
import {
  FaCross,
  FaHeart,
  FaEye,
  FaHands,
  FaRegLightbulb,
  FaStar,
  FaCompass,
} from "react-icons/fa";
// import prayer from "@/assets/animations/mudar.json";
// import angel from "@/assets/animations/mudar.json";
// import rosary from "@/assets/animations/mudar.json";
import Church from "@/assets/animations/church.json";

export const infograficoData = [
  {
    id: 1,
    title: "Origem da Devoção",
    body: `<p>
        - Surgiu por inspiração divina ao Padre Pio Angelotti em um sonho.<br/> 
        - A imagem mostrava Nossa Senhora vestida de branco, com o Menino Jesus dormindo sob seu seio, em paz.<br/>
        - Mais tarde, encontrou a imagem idêntica sem nome em uma feira. A partir disso, nasceu o título e a espiritualidade.
      </p>`,
    icon: FaCross,
    lottie: Church,
    image_position: "float-start",
  },
  {
    id: 2,
    title: "Mensagem Central",
    body: `<p>
        - Maria é mãe e formadora do Amor Misericordioso de Deus.<br/>
        - Inspira a cura interior, o autoconhecimento e a comunhão com a vontade do Pai.<br/>
        - Envia os filhos a serem Recantos vivos da misericórdia no mundo.
      </p>`,
    icon: FaHeart,
    image_position: "float-left",
  },
  {
    id: 3,
    title: "Simbologia da Imagem",
    body: `<p>
        - Menino Jesus dormindo: confiança plena no amor da Mãe.<br/>
        - Túnica branca: pureza, docilidade e luz.<br/>
        - Mãos acolhedoras: Maria é o primeiro Recanto da humanidade.
      </p>`,
    icon: FaEye,
    image_position: "float-end",
  },
  {
    id: 4,
    title: "Práticas de Devoção",
    body: `<p>
        - Dia litúrgico: Sábado após o Domingo da Misericórdia.<br/>
        - Oração oficial à Mãe do Amor Misericordioso.<br/>
        - Terço do Amor Misericordioso e Novena das Virtudes de Maria.
      </p>`,
    icon: FaHands,
    lottie: Church,
    image_position: "float-right",
  },
  {
    id: 5,
    title: "Atos Devocionais",
    body: `<p>
        - Terço diário<br/>
        - Confissão mensal<br/>
        - Adoração semanal<br/>
        - Missa dominical<br/>
        - Oração mariana pessoal
      </p>`,
    icon: FaRegLightbulb,
    image_position: "float-start",
  },
  {
    id: 6,
    title: "Oração à Espiritualidade",
    body: "Ó Maria, Mãe do Amor Misericordioso... Concedei-me a sabedoria do alto e o verdadeiro amor para ver com os olhos de Deus.",
    icon: FaStar,
    lottie: Church,
    image_position: "float-right",
  },
  {
    id: 7,
    title: "Chamado",
    body: "Maria chama à vida interior, ao equilíbrio emocional e à missão como apóstolo do Amor Misericordioso.",
    icon: FaCompass,
    image_position: "float-left",
  },
  {
    id: 8,
    title: "Intercessão",
    body: "Nossa Senhora Mãe do Amor Misericordioso, rogai por nós que recorremos a vós!",
    icon: FaHands,
    image_position: "float-start",
  },
  {
    id: 9,
    title: "Encerramento",
    body: "Paz e Unção! Viva a vontade do Pai com Maria. @recantodoamormisericordioso",
    icon: FaRegLightbulb,
    image_position: "float-end",
  },
];
