import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WhatsAppContactProps {
  missionarioPhone?: string;
  missionarioName?: string;
}

export default function WhatsAppContact({ missionarioPhone, missionarioName }: WhatsAppContactProps) {
    const createWhatsAppLink = (message: string) => {
        const phone = missionarioPhone?.replace(/\D/g, '') || '5511999999999'; // Número padrão se não tiver
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${phone}?text=${encodedMessage}`;
    };

    const quickMessages = [
        {
            label: 'Pedir Oração',
            message: `Olá ${missionarioName || 'Missionário'}! Gostaria de pedir suas orações por uma intenção especial. Paz e unção! 🙏`
        },
        {
            label: 'Dúvida Formativa',
            message: `Paz e unção, ${missionarioName || 'Missionário'}! Tenho uma dúvida sobre os materiais de formação e gostaria de sua orientação.`
        },
        {
            label: 'Partilhar Alegria',
            message: `Oi ${missionarioName || 'Missionário'}! Quero partilhar uma alegria que Deus colocou no meu coração. Que Deus lhe pague por tudo! ❤️`
        }
    ];

    return (
        <Card className="bg-green-50 border-green-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                    <MessageCircle className="w-5 h-5" />
                    Contato Direto
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-green-700 mb-4">
                    Converse diretamente com {missionarioName || 'seu missionário'} pelo WhatsApp:
                </p>
                {quickMessages.map((msg, index) => (
                    <Button 
                        key={index}
                        variant="outline" 
                        className="w-full text-left justify-start h-auto py-3 border-green-300 hover:bg-green-100"
                        onClick={() => window.open(createWhatsAppLink(msg.message), '_blank')}
                    >
                        <div>
                            <p className="font-medium text-green-800">{msg.label}</p>
                            <p className="text-xs text-green-600 mt-1">{msg.message.substring(0, 50)}...</p>
                        </div>
                    </Button>
                ))}
                <Button 
                    className="w-full bg-green-600 hover:bg-green-700 mt-4"
                    onClick={() => window.open(createWhatsAppLink(`Paz e unção, ${missionarioName || 'Missionário'}!`), '_blank')}
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Conversa Livre
                </Button>
            </CardContent>
        </Card>
    );
}