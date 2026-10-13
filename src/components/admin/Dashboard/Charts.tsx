"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
const COLORS = ["#4a2ee8", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e"];
const axis = { fontSize: 11, fill: "#94a3b8" };
export function ActivityChart({ data }: { data: { day: string; Shipments: number; Deliveries: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}><AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" vertical={false} /><XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={28} />
      <Tooltip /><Legend iconType="circle" />
      <Area type="monotone" dataKey="Shipments" stroke="#4a2ee8" fill="#4a2ee8" fillOpacity={0.12} strokeWidth={2} />
      <Area type="monotone" dataKey="Deliveries" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} /></AreaChart></ResponsiveContainer>
  );
}
export function StatusDonut({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="grid h-60 place-items-center text-sm text-slate-400">No data yet</p>;
  return (
    <ResponsiveContainer width="100%" height={240}><PieChart>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
      <Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer>
  );
}
export function RevenueBars({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}><BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#eef0f6" vertical={false} /><XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} interval="preserveStartEnd" /><YAxis tick={axis} axisLine={false} tickLine={false} width={44} />
      <Tooltip formatter={(v: number) => `ETB ${v.toLocaleString()}`} /><Bar dataKey="revenue" fill="#4a2ee8" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
  );
}
