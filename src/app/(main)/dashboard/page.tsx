"use client";

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, ListTodo, Loader2, AlertTriangle, BookCheck, Clock } from 'lucide-react';
import { isPast } from 'date-fns';

const statusChartConfig = {
  count: {
    label: 'Count',
  },
  "To Do": {
    label: 'To Do',
    color: 'hsl(var(--chart-1))',
  },
  "In Progress": {
    label: 'In Progress',
    color: 'hsl(var(--chart-2))',
  },
  "Done": {
    label: 'Done',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const priorityChartConfig = {
  tasks: {
    label: 'Tasks',
  },
  High: {
    label: 'High',
    color: 'hsl(var(--chart-1))',
  },
  Medium: {
    label: 'Medium',
    color: 'hsl(var(--chart-2))',
  },
  Low: {
    label: 'Low',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;


export default function DashboardPage() {
  const { tasks, isInitialized } = useTasks();

  const stats = React.useMemo(() => {
    if (!isInitialized) return null;
    const overdueTasks = tasks.filter(task => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Done').length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'To Do').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      done: completedTasks,
      overdue: overdueTasks,
    };
  }, [tasks, isInitialized]);

  const tasksByStatusData = React.useMemo(() => {
    if (!stats) return [];
    return [
      { status: 'To Do', count: stats.todo },
      { status: 'In Progress', count: stats.inProgress },
      { status: 'Done', count: stats.done },
    ];
  }, [stats]);

  const tasksByPriorityData = React.useMemo(() => {
    if (!isInitialized) return [];
    const high = tasks.filter(t => t.priority === 'High').length;
    const medium = tasks.filter(t => t.priority === 'Medium').length;
    const low = tasks.filter(t => t.priority === 'Low').length;
    return [
      { name: 'High', tasks: high, fill: 'hsl(var(--chart-1))' },
      { name: 'Medium', tasks: medium, fill: 'hsl(var(--chart-2))' },
      { name: 'Low', tasks: low, fill: 'hsl(var(--chart-3))' },
    ];
  }, [tasks, isInitialized]);

  if (!isInitialized || !stats) {
    return (
      <div className="p-4 md:p-6 grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 grid gap-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All tasks across your board</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.done}</div>
              <p className="text-xs text-muted-foreground">Tasks marked as done</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Tasks you are currently working on</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">Tasks past their due date</p>
            </CardContent>
          </Card>
        </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="min-h-[250px] w-full">
                <BarChart data={tasksByStatusData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4}>
                    {tasksByStatusData.map((entry) => (
                        <Bar key={entry.status} dataKey="count" name={entry.status} fill={statusChartConfig[entry.status as keyof typeof statusChartConfig].color} />
                    ))}
                  </Bar>
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={priorityChartConfig} className="min-h-[250px] w-full">
                <PieChart accessibilityLayer>
                  <ChartTooltip content={<ChartTooltipContent nameKey="tasks" />} />
                  <Pie data={tasksByPriorityData} dataKey="tasks" nameKey="name" cx="50%" cy="50%" outerRadius={80} />
                   <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
