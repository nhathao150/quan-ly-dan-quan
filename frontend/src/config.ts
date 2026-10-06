export const SERVER_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
export const API_BASE_URL = `${SERVER_URL}/api`;


export const TYPE_OPTIONS = [
  'Dân quân thường trực',
  'Dân quân cơ động',
  'Dân quân tại chỗ',
  'Dân quân binh chủng'
];

export const UNIT_MAPPING: Record<string, string[]> = {
  'Dân quân thường trực': [],
  'Dân quân cơ động': ['Đội 1', 'Đội 2', 'Đội 3'],
  'Dân quân tại chỗ': [
    'Khu phố 1', 'Khu phố 2', 'Khu phố 3', 'Khu phố 4', 'Khu phố 5',
    'Khu phố 8', 'Khu phố 9', 'Khu phố 10', 'Khu phố 11', 'Khu phố 12', 'Khu phố 13', 'Khu phố 14',
    'Khu phố 15', 'Khu phố 16', 'Khu phố 17', 'Khu phố 18', 'Khu phố 19', 'Khu phố 20', 'Khu phố 21', 'Khu phố 22'
  ],
  'Dân quân binh chủng': [
    'Thông tin hữu tuyến điện (DQ TTHTĐ)',
    'Thông tin vô tuyến điện (DQ TTVTĐ)',
    'Thông tin vô tuyến (DQ TTVĐ)',
    'Cối 60MM',
    'Cối 82MM',
    'Công binh (DQCB)',
    'Hóa học (DQHH)',
    'Trinh sát (DQTS)',
    'Y tế (DQYT)',
    'Phòng không (DQPH)'
  ]
};
