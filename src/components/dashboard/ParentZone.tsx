import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
import { Heart, BookOpen, Users, ArrowRight } from 'lucide-react';

export default function ParentZone({ filho }) {
    return (
        <Card className="bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200">
            <CardHeader>
                <CardTitle className="text-xl text-sky-800">Espaço dos Pais</CardTitle>
                <CardDescription>
                    Acompanhe e apoie a jornada de fé do(a) seu/sua filho(a), {filho?.full_name?.split(' ')[0] || 'jovem peregrino(a)'}.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                {/* <Link to={createPageUrl('Acompanhamento')}> */}
                    <div className="p-4 bg-white/60 rounded-lg hover:shadow-md transition-shadow h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-6 h-6 text-sky-600" />
                            <h3 className="font-semibold text-slate-800">Acompanhamento</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">Veja as partilhas e o progresso espiritual no diálogo com o missionário.</p>
                        <Button variant="link" className="p-0 h-auto text-sky-700">Ver acompanhamento <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                {/* </Link> */}
                 {/* <Link to={createPageUrl('Formation')}> */}
                    <div className="p-4 bg-white/60 rounded-lg hover:shadow-md transition-shadow h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-6 h-6 text-emerald-600" />
                            <h3 className="font-semibold text-slate-800">Formação</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">Conheça os materiais que estão nutrindo a caminhada de fé do seu filho(a).</p>
                        <Button variant="link" className="p-0 h-auto text-emerald-700">Ver materiais <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                {/* </Link> */}
                 <div className="md:col-span-2 text-center p-4 mt-2 border-t border-sky-200">
                     <p className="text-sm text-slate-600 italic">"Educa a criança no caminho em que deve andar; e até quando envelhecer não se desviará dele." (Pv 22:6)</p>
                 </div>
            </CardContent>
        </Card>
    );
}