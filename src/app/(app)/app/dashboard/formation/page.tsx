'use client'

import React, { useState, useEffect } from 'react';
import { Material } from '@/entities/Material';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { Loader2, Book, Video, FileText, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const iconMap = {
    pdf: <FileText className="w-6 h-6 text-red-500" />,
    video: <Video className="w-6 h-6 text-blue-500" />,
    text: <Book className="w-6 h-6 text-green-500" />,
};

const categoryColors = {
    'regra-de-vida': 'bg-blue-100 text-blue-800',
    'logoterapia': 'bg-purple-100 text-purple-800',
    'espiritualidade': 'bg-emerald-100 text-emerald-800',
    'oracao': 'bg-amber-100 text-amber-800',
    'pastoral': 'bg-rose-100 text-rose-800',
    'default': 'bg-gray-100 text-gray-800'
};

export default function FormationPage() {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const allMaterials = await Material.list();
                const authorizedMaterials = allMaterials.filter(m =>
                    m.authorized_roles?.includes(user.role) ||
                    m.authorized_roles?.includes('all') ||
                    user.role === 'admin'
                );
                setMaterials(authorizedMaterials);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            m.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(materials.map(m => m.category).filter(Boolean))];

    return (
        <div className="space-y-6">
            <header className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-800">Formação Contínua</h1>
                <p className="text-slate-500 mt-2">
                    Materiais fundamentais para nutrir o coração e fortalecer a missão do 
                    Amor Misericordioso.
                </p>
            </header>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Buscar por título, descrição ou categoria..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button 
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                    >
                        Todas
                    </Button>
                    {categories.map(category => (
                        <Button 
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Materiais */}
            {isLoading ? (
                <div className="flex justify-center mt-10">
                    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMaterials.map(material => (
                        <Card key={material.id} className="hover:shadow-lg transition-all duration-300 group">
                            <a 
                                href={material.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block h-full"
                            >
                                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                                    <div className="group-hover:scale-110 transition-transform">
                                        {iconMap[material.type] || iconMap.text}
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg leading-tight group-hover:text-sky-700 transition-colors">
                                            {material.title}
                                        </CardTitle>
                                        {material.category && (
                                            <Badge 
                                                className={`mt-2 text-xs ${categoryColors[material.category] || categoryColors.default}`}
                                            >
                                                {material.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                        {material.description || 'Material de formação para aprofundamento espiritual.'}
                                    </p>
                                </CardContent>
                            </a>
                        </Card>
                    ))}
                    
                    {/* Empty State */}
                    {filteredMaterials.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Book className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                Nenhum material encontrado
                            </h3>
                            <p className="text-slate-500">
                                {searchTerm || selectedCategory !== 'all' 
                                    ? 'Tente ajustar os filtros de busca.' 
                                    : 'Os materiais de formação estão sendo organizados.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Call to action para administradores */}
            {user?.role === 'admin' && (
                <div className="text-center mt-8 p-6 bg-sky-50 border border-sky-200 rounded-lg">
                    <p className="text-slate-700 mb-3">
                        Como administrador, você pode adicionar novos materiais de formação.
                    </p>
                    <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar Material
                    </Button>
                </div>
            )}
        </div>
    );
}