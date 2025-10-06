import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, PlayCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { createPageUrl } from '@/utils';
// import { Link } from 'react-router-dom';

const gratitudes = [
    {
        type: 'video',
        title: 'Uma mensagem do nosso fundador',
        author: 'Fundador',
        description: 'Uma palavra de gratidão sobre o impacto da sua ajuda na vida dos nossos jovens.'
    },
    {
        type: 'text',
        title: 'Carta Aberta aos Benfeitores',
        author: 'Missionários',
        description: 'Como sua doação se transforma em materiais, formação e, acima de tudo, em esperança.'
    }
];

export default function GratitudeCorner() {
    return (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Heart className="w-5 h-5" />
                    Canto da Gratidão
                </CardTitle>
                <CardDescription>
                    Sua generosidade constrói o futuro da nossa obra. Veja o impacto do seu amor.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {gratitudes.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 bg-white/50 rounded-lg">
                        {item.type === 'video' ? <PlayCircle className="w-6 h-6 text-amber-700 mt-1" /> : <FileText className="w-6 h-6 text-amber-700 mt-1" />}
                        <div>
                            <h4 className="font-semibold text-slate-800">{item.title}</h4>
                            <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                    </div>
                ))}
                 <div className="text-center pt-4 border-t border-amber-200/80">
                    <p className="text-sm text-slate-700 mb-3">Deseja continuar apoiando nossa missão?</p>
                    {/* <Link to={createPageUrl('Donate')}>
                        <Button variant="outline" className="border-amber-300 bg-amber-100/50 hover:bg-amber-100 text-amber-800">
                            Fazer uma nova doação
                        </Button>
                    </Link> */}
                </div>
            </CardContent>
        </Card>
    );
}