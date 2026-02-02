import { useState, useEffect, useMemo } from 'react';
import { Material } from '@/entities/Material';
import { useToast } from "@/components/ui/use-toast";
import { UploadFile } from '@/integrations/Core';

export function useAdminMaterials() {
    const { toast } = useToast();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const materialList = await Material.list('-created_date');
            setMaterials(materialList as any);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const filteredMaterials = useMemo(() => {
        return materials.filter(mat => {
            const matchesSearch = mat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                mat.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || mat.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [materials, searchQuery, categoryFilter]);

    const deleteMaterial = async (id: string) => {
        try {
            await Material.delete(id);
            toast({ title: "Sucesso!", description: "Material apagado." });
            fetchMaterials();
            return true;
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao apagar material.", variant: "destructive" });
            return false;
        }
    };

    const saveMaterial = async (formData: any, file: File | null) => {
        try {
            let payload = { ...formData };
            if (file) {
                const result = await UploadFile(file);
                payload.file_url = result.url;
            }
            if (editingMaterial?.id) {
                await Material.update(editingMaterial.id, payload);
                toast({ title: "Sucesso!", description: "Material atualizado." });
            } else {
                await Material.create(payload);
                toast({ title: "Sucesso!", description: "Material criado." });
            }
            setIsDialogOpen(false);
            fetchMaterials();
            return true;
        } catch (error) {
            toast({ title: "Erro", description: "Ocorreu um erro ao salvar." });
            return false;
        }
    };

    const openEdit = (material: Material) => {
        setEditingMaterial(material);
        setIsDialogOpen(true);
    };

    const openNew = () => {
        setEditingMaterial(null);
        setIsDialogOpen(true);
    };

    return {
        materials: filteredMaterials,
        isLoading,
        isDialogOpen,
        setIsDialogOpen,
        editingMaterial,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        deleteMaterial,
        saveMaterial,
        openEdit,
        openNew,
        fetchMaterials
    };
}
