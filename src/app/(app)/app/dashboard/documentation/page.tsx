import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, BookOpen, CircleUserRound, Shield, UserCheck, HandHeart, Briefcase, Wrench } from 'lucide-react';

const SectionCard = ({ title, icon, children }) => (
    <Card className="shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center gap-4">
            {icon}
            <CardTitle className="text-xl text-slate-700">{title}</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none text-slate-600">
            {children}
        </CardContent>
    </Card>
);

const Role = ({ icon, title, children }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50">
        <div className="bg-sky-100 p-3 rounded-full">{icon}</div>
        <div>
            <h4 className="font-semibold text-slate-800">{title}</h4>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                {children}
            </ul>
        </div>
    </div>
);

export default function DocumentationPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50 rounded-lg">
            <header className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">Recanto Digital do Amor Misericordioso</h1>
                <p className="mt-4 text-lg italic text-slate-600">
                    "Não devias tu, igualmente, ter compaixão do teu companheiro, como eu também tive compaixão de ti?" (Mt 18:33)
                </p>
            </header>
            
            <p className="text-lg text-center text-slate-700 leading-relaxed">
                Bem-vindo ao <strong>Recanto Digital</strong>, uma plataforma web desenvolvida para ser o coração online da comunidade Recanto do Amor Misericordioso. Este projeto visa fortalecer os laços fraternos, otimizar a gestão do apostolado e difundir o carisma da compaixão através da tecnologia.
            </p>

            <SectionCard title="Funcionalidades Principais" icon={<Heart className="w-6 h-6 text-red-500" />}>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Dashboard Personalizado:</strong> Página inicial adaptada para cada usuário, com reflexões, atalhos e informações relevantes.</li>
                    <li><strong>Formação Contínua:</strong> Biblioteca de conteúdo restrito (PDFs, vídeos, textos) para formação espiritual.</li>
                    <li><strong>Fórum de Partilha:</strong> Espaço sagrado para troca de experiências, orações e fortalecimento comunitário.</li>
                    <li><strong>Acompanhamento Individual:</strong> Canal de comunicação privado entre Missionários e Recantianos para registro da jornada espiritual.</li>
                    <li><strong>Agenda Comunitária:</strong> Calendário centralizado com eventos, orações e compromissos.</li>
                    <li><strong>Desafios da Compaixão:</strong> Sistema gamificado para incentivar gestos concretos de amor e misericórdia.</li>
                    <li><strong>Área de Doações:</strong> Portal para benfeitores apoiarem a obra com transparência.</li>
                    <li><strong>Painel Administrativo:</strong> Ferramentas para gestão de conteúdo, usuários e relatórios.</li>
                </ul>
            </SectionCard>

            <SectionCard title="Papéis de Usuário (Roles)" icon={<Users className="w-6 h-6 text-sky-500" />}>
                <p className="mb-4">O acesso e as funcionalidades são definidos por papéis, garantindo uma experiência focada na missão de cada um:</p>
                <div className="space-y-4 mt-4">
                     <Role icon={<CircleUserRound className="w-5 h-5 text-sky-600"/>} title="Recantiano">
                        <li>Acessa materiais formativos adaptados.</li>
                        <li>Participa dos "Desafios da Compaixão" e registra seu diário.</li>
                        <li>Comunica-se com seu missionário no "Acompanhamento Individual".</li>
                     </Role>
                     <Role icon={<UserCheck className="w-5 h-5 text-green-600"/>} title="Missionário">
                        <li>Acompanha Recantianos, enviando mensagens e notas de progresso.</li>
                        <li>Modera e participa ativamente do Fórum.</li>
                        <li>Acessa conteúdo formativo completo e a Agenda Comunitária.</li>
                     </Role>
                     <Role icon={<Shield className="w-5 h-5 text-purple-600"/>} title="Pai/Mãe">
                        <li>Vinculado ao perfil de seu filho(a) Recantiano.</li>
                        <li>Visualiza a comunicação no "Acompanhamento" para apoiar a jornada.</li>
                     </Role>
                     <Role icon={<HandHeart className="w-5 h-5 text-pink-600"/>} title="Benfeitor">
                        <li>Acessa a página de doações e o "Canto da Gratidão".</li>
                     </Role>
                      <Role icon={<Briefcase className="w-5 h-5 text-orange-600"/>} title="Colaborador">
                        <li>Perfil para voluntários, com acesso a uma área de "Tarefas" para apoiar atividades.</li>
                     </Role>
                     <Role icon={<Wrench className="w-5 h-5 text-gray-600"/>} title="Admin">
                        <li>Acesso total para gerenciar conteúdo, eventos, doações e usuários.</li>
                     </Role>
                </div>
            </SectionCard>
            
            <footer className="text-center text-slate-500 pt-8 border-t mt-12">
                <p>Este projeto é um testemunho vivo de como a tecnologia pode servir à evangelização e ao cuidado das almas.</p>
                <p className="font-semibold mt-4">Paz e Unção!</p>
            </footer>
        </div>
    );
}