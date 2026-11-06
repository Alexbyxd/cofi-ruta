import { z } from 'zod';

export const CATEGORY_SLUGS = [
  'cafes-calientes',
  'bebidas-frias',
  'reposteria',
  'desayunos',
  'salados',
  'especiales',
] as const;

export const TAG_SLUGS = [
  'cafe-de-especialidad',
  'wifi',
  'pet-friendly',
  'para-trabajar',
  'postres-artesanales',
] as const;

export const HOURS_PRESETS = [
  'standard',
  'extended',
  'daytime',
  'evening',
  'morning',
  'university',
] as const;

export const MENU_TEMPLATE_KEYS = [
  'standard',
  'especialidad',
  'postres',
  'desayuno',
  'coworking',
  'ludico',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
export type TagSlug = (typeof TAG_SLUGS)[number];
export type HoursPreset = (typeof HOURS_PRESETS)[number];
export type MenuTemplateKey = (typeof MENU_TEMPLATE_KEYS)[number];

export interface OpeningHourSeed {
  dayOfWeek: number;
  open: string;
  close: string;
}

export interface MenuItemSeed {
  category: CategorySlug;
  name: string;
  description: string;
  price: string;
}

export const categories: {
  slug: CategorySlug;
  name: string;
  sortOrder: number;
}[] = [
  { slug: 'cafes-calientes', name: 'Bebidas calientes', sortOrder: 1 },
  { slug: 'bebidas-frias', name: 'Bebidas frías', sortOrder: 2 },
  { slug: 'reposteria', name: 'Repostería', sortOrder: 3 },
  { slug: 'desayunos', name: 'Desayunos', sortOrder: 4 },
  { slug: 'salados', name: 'Sándwiches y salados', sortOrder: 5 },
  { slug: 'especiales', name: 'Especiales de la casa', sortOrder: 6 },
];

export const tags: { slug: TagSlug; name: string }[] = [
  { slug: 'cafe-de-especialidad', name: 'Café de especialidad' },
  { slug: 'wifi', name: 'Wi-Fi' },
  { slug: 'pet-friendly', name: 'Pet friendly' },
  { slug: 'para-trabajar', name: 'Para trabajar' },
  { slug: 'postres-artesanales', name: 'Postres artesanales' },
];

const weekdays = [1, 2, 3, 4, 5, 6];

export const hoursPresets: Record<HoursPreset, OpeningHourSeed[]> = {
  standard: weekdays.map((dayOfWeek) => ({
    dayOfWeek,
    open: '09:00',
    close: '21:00',
  })),
  extended: [1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => ({
    dayOfWeek,
    open: '08:00',
    close: '22:00',
  })),
  daytime: weekdays.map((dayOfWeek) => ({
    dayOfWeek,
    open: '08:00',
    close: '20:00',
  })),
  evening: weekdays.map((dayOfWeek) => ({
    dayOfWeek,
    open: '17:30',
    close: '22:00',
  })),
  morning: weekdays.map((dayOfWeek) => ({
    dayOfWeek,
    open: '07:30',
    close: '13:00',
  })),
  university: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    dayOfWeek,
    open: '07:30',
    close: '16:00',
  })),
};

export const menuTemplates: Record<MenuTemplateKey, MenuItemSeed[]> = {
  standard: [
    {
      category: 'cafes-calientes',
      name: 'Café americano',
      description: 'Café de grano tostado medio, servido largo.',
      price: '10.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Cappuccino',
      description: 'Espresso con leche vaporizada y espuma cremosa.',
      price: '16.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Submarino con churros',
      description: 'Leche caliente con chocolate y churros fritos.',
      price: '14.00',
    },
    {
      category: 'reposteria',
      name: 'Torta de chocolate',
      description: 'Porción de bizcocho húmedo con ganache.',
      price: '16.00',
    },
    {
      category: 'salados',
      name: 'Salteña de pollo',
      description: 'Salteña horneada con relleno jugoso de pollo.',
      price: '7.00',
    },
    {
      category: 'salados',
      name: 'Sándwich de queso',
      description: 'Pan de molde tostado con queso fundido.',
      price: '15.00',
    },
  ],
  especialidad: [
    {
      category: 'cafes-calientes',
      name: 'Espresso doble',
      description: 'Doble extracción de café de especialidad.',
      price: '12.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Flat white',
      description: 'Espresso con leche microespumada.',
      price: '18.00',
    },
    {
      category: 'bebidas-frias',
      name: 'Cold brew',
      description: 'Café infusionado en frío durante 18 horas.',
      price: '20.00',
    },
    {
      category: 'reposteria',
      name: 'Cheesecake de maracuyá',
      description: 'Cheesecake cremoso con coulis de maracuyá.',
      price: '20.00',
    },
    {
      category: 'reposteria',
      name: 'Croissant de mantequilla',
      description: 'Hojaldre artesanal horneado en el día.',
      price: '12.00',
    },
    {
      category: 'reposteria',
      name: 'Alfajor de maicena',
      description: 'Alfajor relleno con dulce de leche.',
      price: '8.00',
    },
  ],
  postres: [
    {
      category: 'cafes-calientes',
      name: 'Café con leche',
      description: 'Café pasado con leche caliente.',
      price: '12.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Chocolate caliente',
      description: 'Chocolate espeso con canela.',
      price: '14.00',
    },
    {
      category: 'reposteria',
      name: 'Torta de tres leches',
      description: 'Bizcocho bañado en tres leches.',
      price: '18.00',
    },
    {
      category: 'reposteria',
      name: 'Cupcake de vainilla',
      description: 'Cupcake con frosting de vainilla.',
      price: '12.00',
    },
    {
      category: 'reposteria',
      name: 'Brownie con helado',
      description: 'Brownie tibio acompañado de helado.',
      price: '20.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Té de manzanilla',
      description: 'Infusión de manzanilla natural.',
      price: '8.00',
    },
  ],
  desayuno: [
    {
      category: 'cafes-calientes',
      name: 'Café pasado',
      description: 'Café de filtro servido en taza grande.',
      price: '8.00',
    },
    {
      category: 'desayunos',
      name: 'Api con pastel',
      description: 'Api morado caliente con pastel de queso.',
      price: '10.00',
    },
    {
      category: 'desayunos',
      name: 'Pan con huevo',
      description: 'Pan francés con huevo revuelto.',
      price: '12.00',
    },
    {
      category: 'desayunos',
      name: 'Yogur con granola',
      description: 'Yogur natural con granola y fruta de estación.',
      price: '15.00',
    },
    {
      category: 'bebidas-frias',
      name: 'Jugo de naranja',
      description: 'Jugo de naranja recién exprimido.',
      price: '10.00',
    },
    {
      category: 'desayunos',
      name: 'Tostada con palta',
      description: 'Pan tostado con palta y sal de grano.',
      price: '16.00',
    },
  ],
  coworking: [
    {
      category: 'cafes-calientes',
      name: 'Café americano',
      description: 'Café de grano tostado medio, servido largo.',
      price: '10.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Cappuccino',
      description: 'Espresso con leche vaporizada y espuma cremosa.',
      price: '16.00',
    },
    {
      category: 'bebidas-frias',
      name: 'Frappé de café',
      description: 'Café helado batido con leche y hielo.',
      price: '22.00',
    },
    {
      category: 'salados',
      name: 'Sándwich club',
      description: 'Sándwich triple con pollo, queso y verduras.',
      price: '22.00',
    },
    {
      category: 'salados',
      name: 'Empanada de carne',
      description: 'Empanada horneada con relleno de carne.',
      price: '7.00',
    },
    {
      category: 'reposteria',
      name: 'Galleta de avena',
      description: 'Galleta artesanal de avena y pasas.',
      price: '8.00',
    },
  ],
  ludico: [
    {
      category: 'cafes-calientes',
      name: 'Café moka',
      description: 'Espresso con chocolate y leche vaporizada.',
      price: '18.00',
    },
    {
      category: 'bebidas-frias',
      name: 'Milkshake de chocolate',
      description: 'Batido cremoso de chocolate con helado.',
      price: '22.00',
    },
    {
      category: 'cafes-calientes',
      name: 'Submarino',
      description: 'Leche caliente con barra de chocolate.',
      price: '14.00',
    },
    {
      category: 'reposteria',
      name: 'Waffle con helado',
      description: 'Waffle recién horneado con helado de vainilla.',
      price: '24.00',
    },
    {
      category: 'salados',
      name: 'Nachos con queso',
      description: 'Totopos con queso cheddar fundido.',
      price: '20.00',
    },
    {
      category: 'bebidas-frias',
      name: 'Limonada de hierbabuena',
      description: 'Limonada fresca con hierbabuena.',
      price: '12.00',
    },
  ],
};

const openingHourSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  open: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  close: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const cafeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2),
  description: z.string().min(10),
  address: z.string().min(5),
  neighborhood: z.string().min(2),
  latitude: z.string().regex(/^-?\d{1,3}\.\d{6}$/),
  longitude: z.string().regex(/^-?\d{1,3}\.\d{6}$/),
  phone: z.string().nullable(),
  instagram: z.string().nullable(),
  sourceUrl: z.url(),
  dataNote: z.string().min(10),
  menuTemplate: z.enum(MENU_TEMPLATE_KEYS),
  tags: z.array(z.enum(TAG_SLUGS)).min(1).max(3),
  hours: z.union([z.enum(HOURS_PRESETS), z.array(openingHourSchema).min(1)]),
  signature: z.object({
    category: z.enum(CATEGORY_SLUGS),
    name: z.string().min(2),
    description: z.string().min(5),
    price: z.string().regex(/^\d+\.\d{2}$/),
  }),
});

export const cafesSchema = z.array(cafeSchema).min(15).max(30);

export type CafeSeed = z.infer<typeof cafeSchema>;
