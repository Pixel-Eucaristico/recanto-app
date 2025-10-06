'use client';

import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/entities/User';
import { Loader2 } from 'lucide-react';
import ParentZone from '@/components/dashboard/ParentZone';
import GratitudeCorner from '@/components/dashboard/GratitudeCorner';
import DailyReflection from '@/components/dashboard/DailyReflection';
import WhatsAppContact from '@/components/dashboard/WhatsAppContact';
import QuickNavigation from '@/components/dashboard/QuickNavigation';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();
    const [missionary, setMissionary] = useState(null);
    const [filhoRecantiano, setFilhoRecantiano] = useState(null);

    useEffect(() => {
        const fetchRelatedData = async () => {
            if (!user) return;

            if (user.role === 'recantiano' && (user as any).missionario_responsavel_id) {
                try {
                    const missionaryData = await UserEntity.get((user as any).missionario_responsavel_id);
                    setMissionary(missionaryData);
                } catch (error) {
                    console.error("Failed to fetch missionary data:", error);
                }
            } else if (user.role === 'pai' && (user as any).filho_recantiano_id) {
                try {
                    const filhoData = await UserEntity.get((user as any).filho_recantiano_id);
                    setFilhoRecantiano(filhoData);
                } catch (error) {
                    console.error("Failed to fetch 'filho recantiano' data:", error);
                }
            }
        };
        fetchRelatedData();
    }, [user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            </div>
        );
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    // const firstName = user.full_name.split(' ')[0];

    // The 'isMissionaryOrAdmin' variable is removed as per the outline's final structure
    // and its usage within the JSX is also removed, implying 'QuickNavigation' and 'UpcomingEvents'
    // will be rendered for all roles falling into the final 'else' block (missionario, admin, colaborador).

    return (
        <div className="space-y-8">
            <header className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-800">
                    {/* {getGreeting()}, {firstName}! */}
                </h1>
                <p className="text-slate-500 mt-2">
                    Paz e Unção. Bem-vindo(a) de volta ao seu Recanto Digital.
                </p>
            </header>

            {user.role === 'pai' ? (
                <ParentZone filho={filhoRecantiano} />
            ) : user.role === 'benfeitor' ? (
                <GratitudeCorner />
            ) : user.role === 'recantiano' ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <DailyReflection />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <WhatsAppContact 
                            missionarioName={missionary?.full_name}
                            missionarioPhone={missionary?.phone}
                        />
                    </div>
                </div>
            ) : ( // This block now covers 'missionario', 'admin', and 'colaborador' roles
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <DailyReflection />
                        <div>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6">Suas Atividades</h2>
                            <QuickNavigation />
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        {/* <UpcomingEvents /> */}
                    </div>
                </div>
            )}
            
            {['recantiano', 'colaborador'].includes(user.role) && (
                 <div className="text-center py-8">
                    <p className="text-slate-600">
                       Bem-vindo(a)! Explore os recursos disponíveis para você no menu ao lado.
                    </p>
                </div>
            )}
        </div>
    );
}
