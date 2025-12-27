import React from 'react';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, MessageCircle, Calendar, Users, ArrowRight } from 'lucide-react';

const navigationCards = [
    {
        title: 'Formação Contínua',
        description: 'Acesse materiais da Regra de Vida, Logoterapia e espiritualidade do Recanto',
        icon: BookOpen,
        href: 'Formation',
        color: 'from-emerald-50 to-teal-50 border-emerald-200',
        iconColor: 'text-emerald-600'
    },
    {
        title: 'Fórum de Partilha',
        description: 'Compartilhe experiências, peça orações e fortaleça os laços fraternos',
        icon: MessageCircle,
        href: 'Forum',
        color: 'from-purple-50 to-violet-50 border-purple-200',
        iconColor: 'text-purple-600'
    },
    {
        title: 'Acompanhamentos',
        description: 'Veja o progresso dos seus recantianos e mantenha diálogo contínuo',
        icon: Users,
        href: 'Acompanhamento',
        color: 'from-amber-50 to-orange-50 border-amber-200',
        iconColor: 'text-amber-600'
    },
    {
        title: 'Agenda Comunitária',
        description: 'Compromissos, orações e eventos do Recanto do Amor Misericordioso',
        icon: Calendar,
        href: 'Schedule',
        color: 'from-blue-50 to-indigo-50 border-blue-200',
        iconColor: 'text-blue-600'
    }
];

export default function QuickNavigation() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {navigationCards.map((card) => (
                <Card
                    key={card.title}
                    className={`bg-gradient-to-br ${card.color} hover:shadow-md transition-all duration-300 cursor-pointer h-full`}
                >
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                                <span className="text-slate-800">{card.title}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}