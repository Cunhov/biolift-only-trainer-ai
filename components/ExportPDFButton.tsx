import React from 'react';
import { API_URL } from '../config';

interface ExportPDFButtonProps {
    workoutId: string;
    workoutTitle: string;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ workoutId, workoutTitle }) => {
    const [isExporting, setIsExporting] = React.useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_URL}/workouts/${workoutId}/export-pdf`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to export PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${workoutTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erro ao exportar PDF. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            <span>{isExporting ? '⏳' : '📄'}</span>
            <span>{isExporting ? 'Gerando...' : 'Baixar PDF'}</span>
        </button>
    );
};

export default ExportPDFButton;
