import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, BookOpen } from 'lucide-react';

const reflexoes = [
    {
        texto: "Não devias tu, igualmente, ter compaixão do teu companheiro, como eu também tive compaixão de ti?",
        referencia: "Mateus 18:33",
        meditacao: "A compaixão que recebemos de Deus deve transbordar em nossas ações. Como missionários, somos chamados a ser instrumentos desta misericórdia infinita."
    },
    {
        texto: "Bem-aventurados os misericordiosos, porque alcançarão misericórdia.",
        referencia: "Mateus 5:7",
        meditacao: "A misericórdia não é apenas um ato, mas um modo de viver. Cada gesto de compaixão aproxima-nos mais do coração de Cristo."
    },
    {
        texto: "Amai-vos uns aos outros como eu vos amei.",
        referencia: "João 13:34",
        meditacao: "O amor de Cristo é a medida do nosso amor. Não um amor humano limitado, mas um amor divino que transforma e cura."
    },
    {
        texto: "Porque onde estão dois ou três reunidos em meu nome, aí estou eu no meio deles.",
        referencia: "Mateus 18:20",
        meditacao: "Nossa comunidade é sagrada porque Cristo está presente. Cada encontro, cada partilha é uma oportunidade de encontro com o Divino."
    },
    {
        texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
        referencia: "Mateus 11:28",
        meditacao: "Jesus é o refúgio seguro para todos os corações feridos. Como missionários, devemos ser pontes que conduzem a este descanso divino."
    }
];

export default function DailyReflection() {
    // Seleciona uma reflexão baseada no dia do ano para que mude diariamente
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const reflexao = reflexoes[dayOfYear % reflexoes.length];

    return (
        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-sky-800">
                    <Heart className="w-5 h-5" />
                    Reflexão do Dia
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <blockquote className="border-l-4 border-sky-400 pl-4 italic text-slate-700">
                    <p className="text-lg leading-relaxed">"{reflexao.texto}"</p>
                    <footer className="mt-2 text-sm font-semibold text-sky-700">
                        - {reflexao.referencia}
                    </footer>
                </blockquote>
                <div className="flex items-start gap-2 pt-3 border-t border-sky-200">
                    <BookOpen className="w-4 h-4 text-sky-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {reflexao.meditacao}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}