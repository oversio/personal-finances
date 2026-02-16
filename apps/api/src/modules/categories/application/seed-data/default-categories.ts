import type { CategoryTypeValue } from "../../domain/value-objects";

export interface DefaultSubcategory {
  name: string;
  icon?: string;
}

export interface DefaultCategory {
  name: string;
  type: CategoryTypeValue;
  icon?: string;
  color?: string;
  subcategories: DefaultSubcategory[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Categorías de Gastos
  {
    name: "Alimentación",
    type: "expense",
    icon: "utensils",
    color: "#EF4444",
    subcategories: [
      { name: "Supermercado", icon: "shopping-cart" },
      { name: "Restaurantes", icon: "utensils" },
      { name: "Delivery / Comida para llevar", icon: "truck" },
      { name: "Ocasiones especiales", icon: "cake" },
    ],
  },
  {
    name: "Vivienda",
    type: "expense",
    icon: "home",
    color: "#10B981",
    subcategories: [
      { name: "Arriendo / Hipoteca", icon: "key" },
      { name: "Gastos comunes / Comunidad", icon: "building" },
      { name: "Muebles", icon: "sofa" },
      { name: "Artículos para el hogar", icon: "lamp" },
      { name: "Mantenimiento y reparaciones", icon: "wrench" },
      { name: "Contribuciones", icon: "landmark" },
    ],
  },
  {
    name: "Servicios Básicos",
    type: "expense",
    icon: "zap",
    color: "#F59E0B",
    subcategories: [
      { name: "Electricidad", icon: "zap" },
      { name: "Agua", icon: "droplet" },
      { name: "Gas", icon: "flame" },
      { name: "Internet", icon: "wifi" },
      { name: "Teléfono / Celular", icon: "smartphone" },
      { name: "TV / Streaming", icon: "tv" },
    ],
  },
  {
    name: "Transporte",
    type: "expense",
    icon: "car",
    color: "#3B82F6",
    subcategories: [
      { name: "Combustible", icon: "fuel" },
      { name: "Transporte público", icon: "bus" },
      { name: "Taxi / Uber", icon: "car" },
      { name: "Estacionamiento", icon: "parking" },
      { name: "Peajes", icon: "milestone" },
      { name: "Seguro vehicular", icon: "shield" },
      { name: "Mantenimiento vehicular", icon: "wrench" },
      { name: "Permisos y revisiones", icon: "file-check" },
    ],
  },
  {
    name: "Viajes",
    type: "expense",
    icon: "plane",
    color: "#06B6D4",
    subcategories: [
      { name: "Vuelos", icon: "plane" },
      { name: "Alojamiento", icon: "bed" },
      { name: "Arriendo de auto", icon: "car" },
      { name: "Comida en viaje", icon: "utensils" },
      { name: "Actividades y tours", icon: "map" },
      { name: "Seguro de viaje", icon: "shield" },
    ],
  },
  {
    name: "Salud",
    type: "expense",
    icon: "heart-pulse",
    color: "#EC4899",
    subcategories: [
      { name: "Consultas médicas", icon: "stethoscope" },
      { name: "Farmacia", icon: "pill" },
      { name: "Laboratorio / Exámenes", icon: "test-tube" },
      { name: "Urgencias", icon: "ambulance" },
      { name: "Odontología", icon: "smile" },
      { name: "Oftalmología", icon: "eye" },
      { name: "Seguro de salud", icon: "shield" },
      { name: "Seguro de vida", icon: "heart" },
    ],
  },
  {
    name: "Entretenimiento",
    type: "expense",
    icon: "gamepad",
    color: "#8B5CF6",
    subcategories: [
      { name: "Cine y espectáculos", icon: "ticket" },
      { name: "Conciertos y eventos", icon: "music" },
      { name: "Deportes y fitness", icon: "dumbbell" },
      { name: "Hobbies y juegos", icon: "gamepad" },
      { name: "Actividades al aire libre", icon: "sun" },
    ],
  },
  {
    name: "Personal",
    type: "expense",
    icon: "user",
    color: "#6366F1",
    subcategories: [
      { name: "Ropa y calzado", icon: "shirt" },
      { name: "Cuidado personal", icon: "sparkles" },
      { name: "Belleza y peluquería", icon: "scissors" },
      { name: "Educación y cursos", icon: "graduation-cap" },
      { name: "Regalos", icon: "gift" },
    ],
  },
  {
    name: "Financiero",
    type: "expense",
    icon: "credit-card",
    color: "#64748B",
    subcategories: [
      { name: "Pago tarjetas de crédito", icon: "credit-card" },
      { name: "Pago de préstamos", icon: "banknote" },
      { name: "Comisiones bancarias", icon: "landmark" },
      { name: "Impuestos", icon: "receipt" },
      { name: "Comisiones internacionales", icon: "globe" },
    ],
  },
  {
    name: "Apoyo Familiar",
    type: "expense",
    icon: "users",
    color: "#F97316",
    subcategories: [
      { name: "Ayuda a familiares", icon: "heart-handshake" },
      { name: "Donaciones", icon: "hand-heart" },
    ],
  },
  {
    name: "Suscripciones",
    type: "expense",
    icon: "repeat",
    color: "#A855F7",
    subcategories: [
      { name: "Streaming", icon: "tv" },
      { name: "Software y apps", icon: "app-window" },
      { name: "Membresías", icon: "id-card" },
    ],
  },

  // Categorías de Ingresos
  {
    name: "Ingresos",
    type: "income",
    icon: "wallet",
    color: "#22C55E",
    subcategories: [
      { name: "Sueldo / Salario", icon: "briefcase" },
      { name: "Trabajo freelance", icon: "laptop" },
      { name: "Rendimientos inversiones", icon: "trending-up" },
      { name: "Arriendos cobrados", icon: "home" },
      { name: "Reembolsos", icon: "rotate-ccw" },
      { name: "Otros ingresos", icon: "plus-circle" },
    ],
  },
];
