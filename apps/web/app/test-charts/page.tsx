"use client";

import { ArrowTrendingUpIcon, CurrencyDollarIcon, WalletIcon } from "@repo/ui/icons";

import {
  AreaChart,
  BarChart,
  ChartContainer,
  DonutChart,
  HorizontalBarChart,
  KpiCard,
  KpiSparklineCard,
  RadialBarChart,
} from "@/_commons/components/charts";

// Sample data for charts
const monthlyData = [
  { month: "Ene", income: 4500, expenses: 3200 },
  { month: "Feb", income: 4800, expenses: 3400 },
  { month: "Mar", income: 5200, expenses: 3800 },
  { month: "Abr", income: 4900, expenses: 3600 },
  { month: "May", income: 5500, expenses: 4100 },
  { month: "Jun", income: 5800, expenses: 4300 },
];

const categoryData = [
  { name: "Alimentación", value: 1200, color: "primary" as const },
  { name: "Transporte", value: 800, color: "success" as const },
  { name: "Entretenimiento", value: 600, color: "warning" as const },
  { name: "Servicios", value: 500, color: "secondary" as const },
  { name: "Otros", value: 400, color: "danger" as const },
];

const expensesByCategory = [
  { category: "Alimentación", amount: 1200 },
  { category: "Transporte", amount: 800 },
  { category: "Entretenimiento", amount: 600 },
  { category: "Servicios", amount: 500 },
  { category: "Otros", amount: 400 },
];

const topExpenses = [
  { name: "Supermercado", amount: 450 },
  { name: "Gasolina", amount: 320 },
  { name: "Restaurantes", amount: 280 },
  { name: "Netflix/Spotify", amount: 180 },
  { name: "Electricidad", amount: 150 },
];

const formatCurrency = (value: number | string) => `$${Number(value).toLocaleString()}`;

export default function TestChartsPage() {
  return (
    <div className="container mx-auto space-y-8 p-8">
      <h1 className="text-3xl font-bold">Chart Components Test</h1>
      <p className="text-default-500">Preview of all chart components with HeroUI styling</p>

      {/* KPI Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">KPI Cards</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            label="Ingresos Totales"
            value="$30,700"
            icon={<CurrencyDollarIcon className="size-5" />}
            trend={{ value: 12.5, label: "vs mes anterior" }}
          />
          <KpiCard
            label="Gastos Totales"
            value="$22,400"
            icon={<WalletIcon className="size-5" />}
            trend={{ value: 8.2, direction: "up", upIsGood: false }}
          />
          <KpiCard
            label="Ahorro Neto"
            value="$8,300"
            icon={<ArrowTrendingUpIcon className="size-5" />}
            trend={{ value: -3.1, label: "vs mes anterior" }}
            variant="bordered"
          />
        </div>
      </section>

      {/* KPI Sparkline Cards (Stock-ticker style) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">KPI Sparkline Cards</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KpiSparklineCard
            title="Balance Total"
            subtitle="Cuenta Corriente"
            value="$5,969.51"
            trendValue={1.2}
            sparklineData={[30, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90]}
          />
          <KpiSparklineCard
            title="Inversiones"
            subtitle="Portafolio USD"
            value="$137,340"
            trendValue={0.3}
            color="warning"
            sparklineData={[50, 55, 45, 60, 55, 65, 50, 70, 60, 75, 65, 70]}
          />
          <KpiSparklineCard
            title="Deuda"
            subtitle="Tarjeta de Crédito"
            value="$2,450"
            trendValue={-0.8}
            upIsGood={false}
            sparklineData={[80, 75, 85, 70, 75, 65, 70, 60, 65, 55, 60, 50]}
          />
          <KpiSparklineCard
            title="Ahorro Mensual"
            subtitle="Meta: $1,000"
            value="$978"
            trendValue={10.9}
            sparklineData={[20, 25, 30, 35, 40, 38, 45, 50, 55, 60, 65, 70]}
          />
          <KpiSparklineCard
            title="Gastos Fijos"
            subtitle="Servicios y arriendo"
            value="$1,250"
            trendValue={0.5}
            color="primary"
            sparklineData={[45, 48, 46, 50, 48, 52, 50, 53, 51, 54, 52, 55]}
          />
          <KpiSparklineCard
            title="Ingresos Extra"
            subtitle="Freelance"
            value="$850"
            trendValue={0}
            sparklineData={[40, 35, 50, 45, 55, 50, 60, 55, 50, 45, 55, 50]}
          />
        </div>
      </section>

      {/* Area Chart */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Area Chart</h2>
        <ChartContainer title="Ingresos vs Gastos" subtitle="Últimos 6 meses">
          <AreaChart
            data={monthlyData}
            xKey="month"
            series={[
              { key: "income", label: "Ingresos", color: "success" },
              { key: "expenses", label: "Gastos", color: "danger" },
            ]}
            height={300}
            showGrid
            showLegend
            tooltipValueFormatter={formatCurrency}
          />
        </ChartContainer>
      </section>

      {/* Bar Charts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Bar Charts</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartContainer title="Gastos por Categoría">
            <BarChart
              data={expensesByCategory}
              xKey="category"
              yKey="amount"
              color="primary"
              height={250}
              barRadius={6}
              tooltipValueFormatter={formatCurrency}
            />
          </ChartContainer>

          <ChartContainer title="Gastos por Categoría (Colores)">
            <BarChart
              data={expensesByCategory}
              xKey="category"
              yKey="amount"
              height={250}
              barRadius={6}
              colorByIndex
              tooltipValueFormatter={formatCurrency}
            />
          </ChartContainer>
        </div>
      </section>

      {/* Horizontal Bar Chart */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Horizontal Bar Chart</h2>
        <ChartContainer title="Top 5 Gastos" subtitle="Este mes">
          <HorizontalBarChart
            data={topExpenses}
            categoryKey="name"
            valueKey="amount"
            height={250}
            colorByIndex
            tooltipValueFormatter={formatCurrency}
          />
        </ChartContainer>
      </section>

      {/* Donut Chart */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Donut Chart</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartContainer title="Distribución de Gastos">
            <DonutChart
              data={categoryData}
              height={300}
              centerLabel={{ value: "$3,500", subtitle: "Total" }}
              tooltipValueFormatter={formatCurrency}
            />
          </ChartContainer>

          <ChartContainer title="Sin Centro Label">
            <DonutChart
              data={categoryData}
              height={300}
              innerRadius="50%"
              tooltipValueFormatter={formatCurrency}
            />
          </ChartContainer>
        </div>
      </section>

      {/* Radial Bar Chart */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Radial Bar Chart</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <RadialBarChart
              value={75}
              color="primary"
              centerLabel={{ value: "75%", subtitle: "Presupuesto" }}
            />
            <p className="mt-2 text-sm text-default-500">Primary</p>
          </div>

          <div className="text-center">
            <RadialBarChart
              value={45}
              color="success"
              centerLabel={{ value: "45%", subtitle: "Ahorro" }}
            />
            <p className="mt-2 text-sm text-default-500">Success</p>
          </div>

          <div className="text-center">
            <RadialBarChart
              value={90}
              color="warning"
              centerLabel={{ value: "90%", subtitle: "Límite" }}
            />
            <p className="mt-2 text-sm text-default-500">Warning</p>
          </div>

          <div className="text-center">
            <RadialBarChart
              value={95}
              color="danger"
              centerLabel={{ value: "95%", subtitle: "Excedido" }}
            />
            <p className="mt-2 text-sm text-default-500">Danger</p>
          </div>
        </div>
      </section>

      {/* Stacked Charts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Stacked Charts</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartContainer title="Area Chart (Stacked)">
            <AreaChart
              data={monthlyData}
              xKey="month"
              series={[
                { key: "income", label: "Ingresos", color: "success" },
                { key: "expenses", label: "Gastos", color: "danger" },
              ]}
              height={250}
              stacked
              tooltipValueFormatter={formatCurrency}
            />
          </ChartContainer>

          <ChartContainer title="Bar Chart (Stacked)">
            <BarChart
              data={monthlyData}
              xKey="month"
              series={[
                { key: "income", label: "Ingresos", color: "success" },
                { key: "expenses", label: "Gastos", color: "danger" },
              ]}
              height={250}
              stacked
              showLegend
              tooltipValueFormatter={formatCurrency}
            />
          </ChartContainer>
        </div>
      </section>
    </div>
  );
}
