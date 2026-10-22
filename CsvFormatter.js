// Responsabilité extraite de ReportService : la mise en forme CSV.
export class CsvFormatter {
  format(stats) {
    const { byCategory, revenueHT, vat, revenueTTC } = stats;
    let output = 'categorie;montant_ht\n';
    for (const c of Object.keys(byCategory).sort()) output += `${c};${byCategory[c]}\n`;
    output += `TOTAL HT;${revenueHT}\nTVA;${vat}\nTOTAL TTC;${revenueTTC}\n`;
    return output;
  }
}
