import React from 'react';

interface ExportPDFButtonProps {
    workoutId: string;
    workoutTitle: string;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ workoutId, workoutTitle }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition-all shadow-lg flex items-center gap-2"
        >
            <span>🖨️</span>
            <span>Imprimir / Salvar PDF</span>
        </button>
    );
};

export default ExportPDFButton;
