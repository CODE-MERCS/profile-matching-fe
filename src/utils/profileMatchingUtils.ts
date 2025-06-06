// // src/utils/profileMatchingUtils.ts

// export interface ValidationError {
//   pelamarId: number;
//   pelamarName: string;
//   subkriteriaId: number;
//   subkriteriaName: string;
//   message: string;
// }

// export class ProfileMatchingValidator {
//   static validateMatrixData(
//     matrixValues: Record<string, Record<string, number>>,
//     pelamars: Array<{id_pelamar: number, namapelamar: string}>,
//     subkriterias: Array<{id_subkriteria: number, namasubkriteria: string}>
//   ): ValidationError[] {
//     const errors: ValidationError[] = [];

//     pelamars.forEach(pelamar => {
//       subkriterias.forEach(subkriteria => {
//         const value = matrixValues[pelamar.id_pelamar.toString()]?.[subkriteria.id_subkriteria.toString()];
        
//         if (value === undefined || value === null) {
//           errors.push({
//             pelamarId: pelamar.id_pelamar,
//             pelamarName: pelamar.namapelamar,
//             subkriteriaId: subkriteria.id_subkriteria,
//             subkriteriaName: subkriteria.namasubkriteria,
//             message: 'Nilai belum diisi'
//           });
//         } else if (value < 0 || value > 100) {
//           errors.push({
//             pelamarId: pelamar.id_pelamar,
//             pelamarName: pelamar.namapelamar,
//             subkriteriaId: subkriteria.id_subkriteria,
//             subkriteriaName: subkriteria.namasubkriteria,
//             message: 'Nilai harus antara 0-100'
//           });
//         } else if (!Number.isInteger(value)) {
//           errors.push({
//             pelamarId: pelamar.id_pelamar,
//             pelamarName: pelamar.namapelamar,
//             subkriteriaId: subkriteria.id_subkriteria,
//             subkriteriaName: subkriteria.namasubkriteria,
//             message: 'Nilai harus berupa bilangan bulat'
//           });
//         }
//       });
//     });

//     return errors;
//   }

//   static getValidationSummary(errors: ValidationError[]): string {
//     if (errors.length === 0) return '';
    
//     const errorCount = errors.length;
//     const pelamarWithErrors = new Set(errors.map(e => e.pelamarName)).size;
    
//     if (errorCount <= 3) {
//       return errors.map(e => `${e.pelamarName} - ${e.subkriteriaName}: ${e.message}`).join('; ');
//     }
    
//     return `${errorCount} kesalahan ditemukan pada ${pelamarWithErrors} pelamar. Silakan periksa input Anda.`;
//   }
// }

// export class ProfileMatchingFormatter {
//   static formatPercentage(value: number, decimals: number = 1): string {
//     return `${value.toFixed(decimals)}%`;
//   }

//   static formatScore(value: number, decimals: number = 2): string {
//     return value.toFixed(decimals);
//   }

//   static formatRanking(rank: number): string {
//     if (rank === 1) return '🥇 Peringkat 1';
//     if (rank === 2) return '🥈 Peringkat 2'; 
//     if (rank === 3) return '🥉 Peringkat 3';
//     return `#${rank}`;
//   }

//   static getStatusColor(rank: number): string {
//     if (rank === 1) return 'text-yellow-600 bg-yellow-50';
//     if (rank === 2) return 'text-gray-600 bg-gray-50';
//     if (rank === 3) return 'text-orange-600 bg-orange-50';
//     return 'text-blue-600 bg-blue-50';
//   }

//   static getStatusLabel(rank: number): string {
//     if (rank === 1) return 'Terpilih';
//     if (rank <= 3) return 'Kandidat';
//     return 'Pertimbangan';
//   }
// }

// export class ProfileMatchingCalculator {
//   static convertValueToScale(value: number): number {
//     if (value >= 80) return 4; // Sangat Baik
//     if (value >= 65) return 3; // Baik
//     if (value >= 45) return 2; // Cukup Baik
//     return 1; // Kurang Baik
//   }

//   static calculateGap(inputValue: number, targetValue: number): number {
//     const convertedInput = this.convertValueToScale(inputValue);
//     return convertedInput - targetValue;
//   }

//   static getGapWeight(gap: number): number {
//     // Mapping GAP ke bobot berdasarkan metode Profile Matching
//     const gapWeightMap: Record<number, number> = {
//       0: 5,    // Tidak ada gap
//       1: 4.5,  // Kelebihan 1 tingkat
//       -1: 4,   // Kekurangan 1 tingkat
//       2: 3.5,  // Kelebihan 2 tingkat
//       -2: 3,   // Kekurangan 2 tingkat
//       3: 2.5,  // Kelebihan 3 tingkat
//       -3: 2,   // Kekurangan 3 tingkat
//       4: 1.5,  // Kelebihan 4 tingkat
//       -4: 1    // Kekurangan 4 tingkat
//     };

//     return gapWeightMap[gap] || 1; // Default ke 1 jika gap di luar range
//   }
// }

// export const CONVERSION_INFO = {
//   SANGAT_BAIK: { min: 80, max: 100, scale: 4, label: 'Sangat Baik' },
//   BAIK: { min: 65, max: 79, scale: 3, label: 'Baik' },
//   CUKUP_BAIK: { min: 45, max: 64, scale: 2, label: 'Cukup Baik' },
//   KURANG_BAIK: { min: 0, max: 44, scale: 1, label: 'Kurang Baik' }
// };

// export const STATUS_COLORS = {
//   CF: 'bg-green-100 text-green-800',
//   SF: 'bg-yellow-100 text-yellow-800'
// };

// export const RANKING_COLORS = {
//   1: 'bg-yellow-50 border-yellow-200 text-yellow-800',
//   2: 'bg-gray-50 border-gray-200 text-gray-800', 
//   3: 'bg-orange-50 border-orange-200 text-orange-800',
//   default: 'bg-blue-50 border-blue-200 text-blue-800'
// };