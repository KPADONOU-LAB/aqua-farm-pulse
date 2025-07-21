import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export const exportToPDF = async (elementId: string, filename: string = 'rapport.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Élément non trouvé');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    throw error;
  }
};

export const exportToExcel = (data: any[], filename: string = 'donnees.xlsx', sheetName: string = 'Données') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
};

export const generateCageReport = (cageData: any) => {
  return {
    'Nom de la cage': cageData.nom,
    'Espèce': cageData.espece,
    'Nombre de poissons': cageData.nombre_poissons,
    'Poids moyen (g)': cageData.poids_moyen,
    'Statut': cageData.statut,
    'Date d\'introduction': cageData.date_introduction,
    'FCR': cageData.fcr,
    'Taux de croissance': cageData.croissance,
    'Taux de mortalité (%)': cageData.taux_mortalite,
    'Biomasse totale (kg)': (cageData.nombre_poissons * cageData.poids_moyen / 1000).toFixed(2),
    'Date du rapport': new Date().toLocaleDateString('fr-FR')
  };
};

export const generateFinancialReport = (financialData: any[]) => {
  return financialData.map(item => ({
    'Date': new Date(item.date_transaction).toLocaleDateString('fr-FR'),
    'Type': item.type_transaction,
    'Catégorie': item.categorie,
    'Montant (€)': item.montant,
    'Description': item.description,
    'Référence': item.reference_document || 'N/A'
  }));
};

export const generateFeedingReport = (feedingData: any[]) => {
  return feedingData.map(session => ({
    'Date': new Date(session.date_alimentation).toLocaleDateString('fr-FR'),
    'Heure': session.heure,
    'Cage': session.cage?.nom || 'N/A',
    'Type d\'aliment': session.type_aliment,
    'Quantité (kg)': session.quantite,
    'Appétit': session.appetit,
    'Observations': session.observations || 'Aucune'
  }));
};

export const generateWaterQualityReport = (waterData: any[]) => {
  return waterData.map(measurement => ({
    'Date': new Date(measurement.date_mesure).toLocaleDateString('fr-FR'),
    'Heure': measurement.heure,
    'Cage': measurement.cage?.nom || 'N/A',
    'Température (°C)': measurement.temperature,
    'pH': measurement.ph,
    'Oxygène dissous (mg/L)': measurement.oxygene_dissous,
    'Turbidité (NTU)': measurement.turbidite,
    'Statut': measurement.statut,
    'Observations': measurement.observations || 'Aucune'
  }));
};