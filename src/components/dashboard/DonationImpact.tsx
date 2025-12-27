import React, { useState, useEffect } from 'react';
import { Donation } from '@/entities/Donation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, BookOpen, Calendar } from 'lucide-react';

export default function DonationImpact() {
    const [totalDonations, setTotalDonations] = useState(0);
    const [donationCount, setDonationCount] = useState(0);

    useEffect(() => {
        const fetchDonationData = async () => {
            try {
                const donations = await Donation.filter({ status: 'confirmado' });
                const total = donations.reduce((sum, donation) => sum + (donation.value || 0), 0);
                setTotalDonations(total);
                setDonationCount(donations.length);
            } catch (error) {
                console.error("Failed to fetch donation data:", error);
            }
        };
        fetchDonationData();
    }, []);

    const impactStats = [
        {
            icon: Heart,
            title: "Corações Alcançados",
            value: "150+",
            description: "Recantianos acompanhados"
        },
        {
            icon: Users,
            title: "Famílias Atendidas",
            value: "80+",
            description: "Famílias beneficiadas"
        },
        {
            icon: BookOpen,
            title: "Materiais Formativos",
            value: "25+",
            description: "Recursos disponibilizados"
        },
        {
            icon: Calendar,
            title: "Eventos Realizados",
            value: "12+",
            description: "Este ano"
        }
    ];

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-800">
                        <Heart className="w-5 h-5" />
                        Impacto da Sua Generosidade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center mb-4">
                        <p className="text-3xl font-bold text-emerald-700">R$ {totalDonations.toFixed(2)}</p>
                        <p className="text-sm text-emerald-600">
                            Arrecadados de {donationCount} doadores generosos
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {impactStats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-2">
                                    <stat.icon className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="font-bold text-emerald-800">{stat.value}</p>
                                <p className="text-xs text-emerald-600">{stat.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                    <p className="text-sm text-amber-800 leading-relaxed text-center">
                        <strong>"Não devias tu, igualmente, ter compaixão do teu companheiro?"</strong><br />
                        Sua doação é um ato de amor que ecoa na eternidade, curando corações e restaurando vidas.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}